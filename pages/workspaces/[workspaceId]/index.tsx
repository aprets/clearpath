import {Button, SimpleGrid, Box, Text, Title, Center, Alert, Loader, Container, Image, Group, Stack, Blockquote, Divider, Grid, Input, Card, Accordion, Badge, AccordionState, Paper, Spoiler, Popover} from '@mantine/core'
import {useClipboard} from '@mantine/hooks'
import {useModals} from '@mantine/modals'
import {hideNotification, showNotification, updateNotification} from '@mantine/notifications'
import {collection, doc, getFirestore, orderBy, query} from 'firebase/firestore'
import Link from 'next/link'
import {useRouter} from 'next/router'
import {ReactNode, useState} from 'react'
import {useCollection, useCollectionData, useDocumentData} from 'react-firebase-hooks/firestore'
import {objectGrid, openInNewWindow, Sensitive} from '../../../components/VarDisplay'
import {WorkflowModal} from '../../../components/Workflows/Modal'
import {Run, runStatusToMantineColor} from '../../../lib/run'
import {snakeToTitle} from '../../../lib/text'
import {Workspace, workspaceStateToApplyText, workspaceStateToHelpText, workspaceStateToLabel, workspaceStateToMantineColor} from '../../../lib/workspace'

export default function WorkspacePage() {
	const router = useRouter()
	const {workspaceId: rawWorkspaceId} = router.query
	const workspaceId = rawWorkspaceId.toString()
	const [untypedWorkspace, loadingWorkspace, error] = useDocumentData(doc(getFirestore(), 'workspaces', (workspaceId ?? 'undefined').toString()))
	const workspace = untypedWorkspace as Workspace
	const [runsSnapshot, loadingRuns] = useCollection(
		query(
			collection(getFirestore(), 'workspaces', (workspaceId ?? 'undefined').toString(), 'runs'),
			orderBy('timestamp', 'desc'),
		),
	)
	const runs = runsSnapshot?.docs?.map((s) => ({id: s.id, ...s.data() as Run}))
	const [editOpened, setEditOpened] = useState(false)
	const modals = useModals()

	const startRun = async (type?: 'normal' | 'destroy' | 'nuke') => {
		showNotification({
			id: 'preparingRun',
			loading: true,
			message: 'Preparing a run...',
			autoClose: false,
		})
		const response = await fetch('/api/startRun', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({workspaceId, type: type ?? 'normal'}),
		})
		const runId = await response.text()
		updateNotification({
			id: 'preparingRun',
			loading: false,
			color: 'green',
			title: 'Run Started',
			message: (
				<>
					<Text>{runId}</Text>
					<Button
						mt={8}
						size='xs'
						variant='light'
						radius='lg'
						fullWidth
						onClick={() => {
							router.push(`/workspaces/${workspaceId}/${runId}`)
							hideNotification('preparingRun')
						}}
					>
						SHOW
					</Button>
				</>
			),
			autoClose: 5000,
		})
	}

	const showDestroyModal = () => {
		const id = modals.openModal({
			title: 'Please confirm your action',
			children: (
				<>
					<Text>
						This action will permanently and irreversibly destroy all the infrastructure
						in the workspace. You can later recreate the workspace infrastructure but destroying it
						may cause <Text component='span' color='red'>PERMANENT DATA LOSS</Text>.
					</Text>
					<Button
						color='red'
						fullWidth
						onClick={() => {
							modals.closeModal(id)
							startRun('destroy')
						}}
						mt='md'
					>
						Irreversibly Destroy Infrastructure
					</Button>
					<Text mt={16}>
						If you would also like to permanently destroy this workspace you can click below.
					</Text>
					<Button
						color='red'
						fullWidth
						onClick={() => {
							modals.closeModal(id)
							startRun('nuke')
						}}
						mt='md'
					>
						Irreversibly Destroy Infrastructure & Workspace
					</Button>
					<Text mt={16}>
						If you are unsure, please cancel the operation.
					</Text>
					<Button fullWidth onClick={() => modals.closeModal(id)} mt='md'>
						Cancel
					</Button>
				</>
			),
		})
	}

	if (loadingWorkspace || loadingRuns) {
		return (
			<Center mt={24}>
				<Loader size='xl' />
			</Center>
		)
	}
	if (error || !workspace) {
		return (
			<Center mt={24}>
				<Alert title='Error' color='red'>
					{error ? error.message : 'The workspace you requested does not exist'}
				</Alert>
			</Center>
		)
	}
	return (
		<Container size='xl' mt={16}>
			<WorkflowModal opened={editOpened} setOpened={setEditOpened} type={workspace.type} id={workspaceId} />
			<Group position='apart'>
				<Group>
					<Title order={3}>Workspace {workspace.name}</Title>
					<Badge color={workspaceStateToMantineColor[workspace.state]} size='lg' variant='filled'>{workspaceStateToLabel[workspace.state]}</Badge>
				</Group>
				<Group>
					{workspace?.outputs?.shell_url && (
						<Button
							color='indigo'
							onClick={openInNewWindow(workspace.outputs.shell_url as string)}
						>
							Open Shell
						</Button>
					)}
					{workspace?.outputs?.url && (
						<Button
							component='a'
							color='indigo'
							href={workspace.outputs.url as string}
							target='_blank'
							rel='noreferrer'
						>
							Open URL
						</Button>
					)}
					<Button
						disabled={workspace.state === 'changing'}
						onClick={() => { setEditOpened(true) }}
					>
						Edit
					</Button>
					<Button
						disabled={workspace.state === 'changing'}
						onClick={() => startRun('normal')}
					>
						{workspaceStateToApplyText[workspace.state]}
					</Button>
					<Button
						color='red'
						variant='outline'
						disabled={workspace.state === 'changing'}
						onClick={showDestroyModal}
					>
						Destroy
					</Button>
				</Group>
			</Group>

			<Alert color={workspaceStateToMantineColor[workspace.state]} my={20}>
				{workspaceStateToHelpText[workspace.state]}
			</Alert>

			<Accordion multiple offsetIcon={false} initialState={[true, false, true] as unknown as AccordionState}>
				<Accordion.Item label='Outputs'>
					<Alert mb={5}>
						These are the outputs of the infrastructure provisioning. Those usually include ip addresses, usernames
						and any other useful details about the provisioned infrastructure.
					</Alert>
					{objectGrid(workspace.outputs)}

				</Accordion.Item>
				<Accordion.Item label='Variables'>
					<Alert mb={5}>
						You can change the variables by editing the workspace
					</Alert>
					{objectGrid(workspace.vars)}

				</Accordion.Item>
				<Accordion.Item label='Runs'>
					<Alert mb={5}>
						Runs represent iterations of infrastructure changes. Click on a run to see details.
						To start a new run click &quot;{workspaceStateToApplyText[workspace.state]}&quot; at the top right.
					</Alert>
					{runs.map((run) => (
						<Link href={`/workspaces/${workspaceId}/${run.id}`} passHref>
							<Paper key={run.id} component='a' withBorder p='md' my={10}>
								<Group position='apart'>
									<Text weight={500}>
										{run.timestamp.toDate().toUTCString()}
										<Text ml={8} component='span' size='sm' color='grey'>{run.id}</Text>
										<Text ml={8} component='span' size='sm' color='grey'>{run.tfId}</Text>
									</Text>
									<Badge color={runStatusToMantineColor[run.tfStatus]} size='lg' variant='filled'>{snakeToTitle(run.tfStatus)}</Badge>
								</Group>
							</Paper>
						</Link>
					))}

				</Accordion.Item>
			</Accordion>

			<Group />
		</Container>

	)
}
