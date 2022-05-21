import {Button, Badge, Text, Title, Center, Alert, Loader, Container, Accordion, Group, Stack, Blockquote, Divider, Grid, Input, Card, Timeline, Box} from '@mantine/core'
import {doc, getFirestore} from 'firebase/firestore'
import {useRouter} from 'next/router'
import {useDocumentData} from 'react-firebase-hooks/firestore'
import AnsiUp from 'ansi_up'
import {MdArrowBack} from 'react-icons/md'
import {IoCloudUploadSharp, IoDocumentText, IoBuild, IoCloudDoneSharp} from 'react-icons/io5'
import {Run, runStatusToMantineColor, runStatusToTimelineIndex} from '../../../lib/run'
import {snakeToTitle} from '../../../lib/text'
import {objectGrid} from '../../../components/VarDisplay'

export function Log({log}: {log: string}) {
	return (
		<pre className='hide-scrollbars' style={{margin: 0, overflow: 'auto'}} dangerouslySetInnerHTML={{__html: (new AnsiUp()).ansi_to_html(log?.length ? log : 'No logs yet...')}} />
	)
}

export default function RunPage() {
	const router = useRouter()
	const {workspaceId, runId} = router.query
	const [untypedRun, loading, error] = useDocumentData(doc(getFirestore(), 'workspaces', (workspaceId ?? 'undefined').toString(), 'runs', (runId ?? 'undefined').toString()))
	const run = untypedRun as Run
	if (loading) {
		return (
			<Center mt={24}>
				<Loader size='xl' />
			</Center>
		)
	}
	if (error || !run) {
		return (
			<Center mt={24}>
				<Alert title='Error' color='red'>
					{error ? error.message : 'The run you requested does not exist'}
				</Alert>
			</Center>
		)
	}
	return (
		<Container size='xl' mt={16}>
			<Button radius='xl' leftIcon={<MdArrowBack />} variant='light' mb={24} onClick={() => { router.push(`/workspaces/${workspaceId}`) }}>Back to Workspace</Button>
			<Group>
				<Title order={3}>{run.timestamp.toDate().toUTCString()}</Title>
				<Badge color={runStatusToMantineColor[run.tfStatus]} size='lg' variant='filled'>{snakeToTitle(run.tfStatus)}</Badge>
			</Group>
			<Group>
				<Text size='sm' color='grey'>{runId}</Text>
				<Text size='sm' color='grey'>{run.tfId}</Text>
			</Group>
			<Center>
				<Timeline
					mt={32}
					active={runStatusToTimelineIndex[run.tfStatus]}
					bulletSize={60}
					lineWidth={4}
					styles={(theme) => ({
						item: {
							paddingBottom: 30,
						},
						itemBody: {
							marginLeft: theme.spacing.lg,
							maxWidth: 1000,
						},
						itemTitle: {
							fontSize: theme.fontSizes.xl,
						},
						itemContent: {
							marginTop: theme.spacing.sm,
						},
					})}
				>
					<Timeline.Item bullet={<IoCloudUploadSharp size={35} />} title='Prepare'>
						<Text>
							The infrastructure configuration is prepared and uploaded to Terraform.
							The variables from the workspace configuration are then applied to complete
							the required infrastructure configuration. At this stage a Terraform &quot;run&quot; is started.
							Once the current infrastructure state is fetched, planning on infrastructure changes will start.
						</Text>
					</Timeline.Item>

					<Timeline.Item bullet={<IoDocumentText size={35} />} title='Plan'>
						<Text>
							During planning, the current infrastructure state, new configuration and new variables will be
							compared. Terraform will calculate the differences between the newly requested infrastructure
							and the existing one and propose the changes needed to get the infrastructure to the desired state.
							Changes will be applied to existing infrastructure where possible, otherwise it will be recreated.
							<br />You can see the planning log including the plan below.
						</Text>
						<Accordion offsetIcon={false}>
							<Accordion.Item label='Logs'>
								<Log log={run.tfPlanLog} />
							</Accordion.Item>
						</Accordion>
					</Timeline.Item>

					<Timeline.Item bullet={<IoBuild size={35} />} title='Apply'>
						<Text>
							The infrastructure changes are being applied to Google Cloud. This will
							make the necessary changes to each infrastructure resources in parallel where possible.
							This involves modifying existing resources, creating new ones, or recreating when needed.
							The entire process usually takes a few seconds or minutes, but SQL Instances cat take 15+ minutes to provision.
							<br />You can see the log of all the changes being made below.

						</Text>
						<Accordion offsetIcon={false}>
							<Accordion.Item label='Logs'>
								<Log log={run.tfApplyLog} />
							</Accordion.Item>
						</Accordion>
					</Timeline.Item>

					<Timeline.Item bullet={<IoCloudDoneSharp size={35} />} title='Finished'>
						<Text>
							The infrastructure changes are complete and all the necessary changes have been made.
							The run is complete. This would have updated the outputs which you can see below.
							The latest output values are always visible in the workspace
						</Text>
						<Accordion offsetIcon={false}>
							<Accordion.Item label='Outputs'>
								{objectGrid(run.outputs)}
							</Accordion.Item>
						</Accordion>
					</Timeline.Item>
				</Timeline>
			</Center>

		</Container>

	)
}
