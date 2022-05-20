/* eslint-disable no-await-in-loop */
import {TerraformCloud} from '@skorfmann/terraform-cloud'
import {WorkspaceRequest} from '@skorfmann/terraform-cloud/dist-types/types/Workspace'

import '../../lib/firebaseAdmin'

import {getFirestore} from 'firebase-admin/firestore'

import type {NextApiRequest, NextApiResponse} from 'next'

declare module '@skorfmann/terraform-cloud' {
	interface Workspace {
		data: {
			attributes: {
				structuredRunOutputEnabled: boolean,
			},
		},
	}
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
	const terraform = new TerraformCloud(process.env.TERRAFORM_TOKEN)

	const db = getFirestore()

	const docRef = db.collection('workspaces').doc(req.body)

	const {name} = await (await docRef.get()).data()

	const result = await terraform.Workspaces.create(process.env.TERRAFORM_ORG, {
		data: {
			type: 'workspaces',
			attributes: {
				name,
				globalRemoteState: false,
				autoApply: true,
				structuredRunOutputEnabled: false,
			},
		},
	} as WorkspaceRequest)

	res.status(200).send(result.id)
}
