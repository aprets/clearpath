/* eslint-disable no-await-in-loop */
import {TerraformCloud, Run as TFRun} from '@skorfmann/terraform-cloud'
import {AxiosResponse} from 'axios'
import tar from 'tar'
import fs from 'fs/promises'

import '../../lib/firebaseAdmin'

import {getFirestore} from 'firebase-admin/firestore'

import type {NextApiRequest, NextApiResponse} from 'next'
import {Timestamp} from 'firebase/firestore'
import {Workspace, WorkspaceState} from '../../lib/workspace'
import {Run} from '../../lib/run'

export default async (req: NextApiRequest, res: NextApiResponse) => {
	const terraform = new TerraformCloud(process.env.TERRAFORM_TOKEN)

	const db = getFirestore()

	const {workspaceId, type} = req.body
	const isDestroy = type === 'destroy'
	const isNuke = type === 'nuke'
	const workspaceDoc = await db.collection('workspaces').doc(workspaceId)
	const workspace = await (await workspaceDoc.get()).data() as Workspace

	const startWorkspaceUpdate: Partial<Workspace> = {
		state: 'changing',
	}
	workspaceDoc.update(startWorkspaceUpdate)

	const runCollection = db.collection(`workspaces/${workspaceId}/runs`)

	const runDoc = await runCollection.doc()

	const configPath = `terraform/${workspace.type}`

	const configurationVersion = await terraform.ConfigurationVersion.create(workspace.tfId, {
		data: {
			type: 'configuration-version',
			attributes: {
				autoQueueRuns: false,
			},
		},
	})
	const configurationStream = await tar.create(
		{
			gzip: true,
			cwd: configPath,
		},
		await fs.readdir(configPath),
	)

	await terraform.ConfigurationVersion.upload(configurationVersion.attributes.uploadUrl, configurationStream)

	const existingVarMap = (await terraform.client.get(`/workspaces/${workspace.tfId}/vars`)).data.reduce((acc, v) => ({...acc, [v.attributes.key]: v.id}), {})

	const gcpCredentialsEnvVarName = 'GOOGLE_CREDENTIALS'
	if (existingVarMap[gcpCredentialsEnvVarName]) {
		const existingId = existingVarMap[gcpCredentialsEnvVarName]
		await terraform.client.patch(`/workspaces/${workspace.tfId}/vars/${existingId}`, {
			data: {
				id: existingId,
				attributes: {
					value: process.env.GCP_CREDENTIALS,
				},
				type: 'vars',
			},
		})
	} else {
		await terraform.client.post(`/workspaces/${workspace.tfId}/vars`, {
			data: {
				type: 'vars',
				attributes: {
					key: gcpCredentialsEnvVarName,
					value: process.env.GCP_CREDENTIALS,
					// description: 'some description',
					category: 'env',
					hcl: false,
					sensitive: true,
				},
			},
		})
	}

	// eslint-disable-next-line no-restricted-syntax
	for (const [key, value] of Object.entries({...workspace.vars, project: process.env.GCP_PROJECT})) {
		if (existingVarMap[key]) {
			const existingId = existingVarMap[key]
			await terraform.client.patch(`/workspaces/${workspace.tfId}/vars/${existingId}`, {
				data: {
					id: existingId,
					attributes: {
						value,
					},
					type: 'vars',
				},
			})
		} else {
			await terraform.client.post(`/workspaces/${workspace.tfId}/vars`, {
				data: {
					type: 'vars',
					attributes: {
						key,
						value,
						// description: 'some description',
						category: 'terraform',
						hcl: false,
						sensitive: false,
					},
				},
			})
		}
	}

	const createdRun = await terraform.Runs.create({
		data: {
			attributes: {
				isDestroy: isDestroy || isNuke,
			},
			relationships: {
				workspace: {
					data: {
						type: 'workspaces',
						id: workspace.tfId,
					},
				},
				configurationVersion: {
					data: {
						id: configurationVersion.id,
						type: 'configuration-versions',
					},
				},
			},
		},
	})

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const run: AxiosResponse<TFRun> & {included?: any[]} = await terraform.client.get<TFRun>(`/runs/${createdRun.id}?include=plan%2Capply`)

	const planLogUrl = run.included.filter((i) => i?.type === 'plans')?.[0]?.attributes?.logReadUrl
	const applyLogUrl = run.included.filter((i) => i?.type === 'applies')?.[0]?.attributes?.logReadUrl

	const initialRunState: Run = {
		timestamp: new Date() as unknown as Timestamp,
		tfId: run.data.id,
		tfStatus: run.data.attributes.status,
	}
	runDoc.set(initialRunState)

	res.status(200).send(runDoc.id)

	process.stdout.write(`Starting refresher ${run.data.id} (${type})\n`)
	let refreshes = 0
	const refresher = setInterval(async () => {
		const result = await terraform.Runs.show(run.data.id)

		const runUpdate: Partial<Run> = {
			tfStatus: result.attributes.status,
			tfPlanLog: await (await fetch(planLogUrl)).text(),
			tfApplyLog: await (await fetch(applyLogUrl)).text(),
		}
		await runDoc.update(runUpdate)

		const isTimeout = refreshes >= 3000

		if (['policy_override', 'errored', 'planned_and_finished', 'canceled', 'force_canceled', 'discarded', 'applied'].includes(result.attributes.status) || isTimeout) {
			clearInterval(refresher)

			if (isTimeout) {
				const endWorkspaceUpdate: Partial<Workspace> = {
					state: 'error',
				}
				workspaceDoc.update(endWorkspaceUpdate)
			} else {
				const isApplied = result.attributes.status === 'applied'

				let outputs
				if (isApplied && !(isDestroy || isNuke)) {
					const stateVersionId = (await terraform.Applies.show(run.data.relationships.apply.data.id)).relationships.stateVersions.data?.[0]?.id
					outputs = (await terraform.client.get(`/state-versions/${stateVersionId}/outputs`)).data.reduce(
						(acc, o) => ({...acc, [o.attributes?.name]: o.attributes?.value}),
						{},
					)
					if (Object.keys(outputs).length) {
						const runOutPutsUpdate: Partial<Run> = {outputs}
						await runDoc.update(runOutPutsUpdate)
					}
				}
				let state: WorkspaceState = 'stable'
				if (['errored'].includes(result.attributes.status) || isTimeout) {
					state = 'error'
				} else if (isDestroy || isNuke) {
					state = 'new'
				}
				const endWorkspaceUpdate: Partial<Workspace> = {
					state,
				}
				if (isApplied && !(isDestroy || isNuke) && Object.keys(outputs).length) {
					endWorkspaceUpdate.outputs = outputs
				}
				workspaceDoc.update(endWorkspaceUpdate)
			}
			process.stdout.write(`\nStopping refresher ${run.data.id} (${result.attributes.status})\n`)
			if (isNuke && !['errored'].includes(result.attributes.status)) {
				terraform.Workspaces.delete(workspace.tfId)

				const query = await runCollection.get()
				const batch = db.batch()
				query.docs.forEach((doc) => {
					batch.delete(doc.ref)
				})
				await batch.commit()

				await workspaceDoc.delete()
			}
		} else {
			process.stdout.write(`${refreshes}/1000 refreshing ${run.data.id} (${result.attributes.status})                  \r`)
		}

		refreshes += 1
	}, 1000)
}
