import {Button, SimpleGrid, Box, Text, Title, Center, Alert, Loader, Container, Image, Group, Stack, Blockquote, Divider, Grid, Input, Card, Accordion, Badge, AccordionState, Paper, Spoiler, Popover} from '@mantine/core'
import {useClipboard} from '@mantine/hooks'
import {useModals} from '@mantine/modals'
import {hideNotification, showNotification, updateNotification} from '@mantine/notifications'
import {collection, doc, getFirestore, orderBy, query} from 'firebase/firestore'
import Link from 'next/link'
import {useRouter} from 'next/router'
import {ReactNode, useState} from 'react'
import {useCollection, useCollectionData, useDocumentData} from 'react-firebase-hooks/firestore'
import {WorkflowModal} from '../../../components/Workflows/Modal'
import {Run, runStatusToMantineColor} from '../../../lib/run'
import {snakeToTitle} from '../../../lib/text'
import {Workspace, workspaceStateToApplyText, workspaceStateToHelpText, workspaceStateToLabel, workspaceStateToMantineColor} from '../../../lib/workspace'

function Sensitive({children}: {children: string}) {
	const clipboard = useClipboard({timeout: 10000})
	const [opened, setOpened] = useState(false)
	return (
		<Popover
			opened={opened}
			onClose={() => setOpened(false)}
			position='bottom'
			placement='center'
			withArrow
			trapFocus={false}
			closeOnEscape={false}
			transition='pop-top-left'
			styles={{body: {pointerEvents: 'none'}}}
			target={(
				<Text
					component='span'
					sx={{color: 'transparent', userSelect: 'none', backgroundColor: '#e8e8e8', cursor: 'pointer'}}
					onClick={() => clipboard.copy(children)}
					onMouseEnter={() => setOpened(true)}
					onMouseLeave={() => {
						setOpened(false)
						setTimeout(() => clipboard.reset(), 300)
					}}
				>
					{children}
				</Text>
			)}
		>
			{clipboard.copied ? 'Copied to clipboard!' : 'Click to copy to clipboard'}
		</Popover>

	)
}

// eslint-disable-next-line @typescript-eslint/comma-dangle
const objectGrid = <T,>(item: T, renderer: (key: keyof T, value: T[keyof T]) => ReactNode) => (
	<SimpleGrid
		cols={4}
		spacing='lg'
		breakpoints={[
			{maxWidth: 'md', cols: 3, spacing: 'md'},
			{maxWidth: 'sm', cols: 2, spacing: 'sm'},
			{maxWidth: 'xs', cols: 1, spacing: 'sm'},
		]}
		mb={8}
	>
		{item && Object.entries(item).map(([k, v]) => (
			renderer(k as keyof T, v)
		))}
	</SimpleGrid>

)

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

			// onCancel: () => console.log('Cancel'),
			// onConfirm: () => console.log('Confirmed'),
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
					{objectGrid(workspace.outputs, (k, v) => (
						<Box key={k}>
							<Text weight={500}>{snakeToTitle(k.toString())}</Text>
							{(k === 'password' && (
								<Sensitive>
									{v.toString()}
								</Sensitive>
							)) || (
								<Text>{v}</Text>
							)}
						</Box>
					))}

				</Accordion.Item>
				<Accordion.Item label='Variables'>
					<Alert mb={5}>
						You can change the variables by editing the workspace
					</Alert>
					{objectGrid(workspace.vars, (k, v) => (
						<Box key={k}>
							<Text weight={500}>{snakeToTitle(k.toString())}</Text>
							<Text>{v}</Text>
						</Box>
					))}

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
