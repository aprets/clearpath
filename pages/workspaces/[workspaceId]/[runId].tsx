import {Button, Badge, Text, Title, Center, Alert, Loader, Container, Image, Group, Stack, Blockquote, Divider, Grid, Input, Card} from '@mantine/core'
import {doc, getFirestore} from 'firebase/firestore'
import {useRouter} from 'next/router'
import {useDocumentData} from 'react-firebase-hooks/firestore'
import AnsiUp from 'ansi_up'
import {MdArrowBack} from 'react-icons/md'
import {runStatusToMantineColor} from '../../../lib/run'
import {snakeToTitle} from '../../../lib/text'

export function LogCard({title, log}: {title: string, log: string}) {
	return (
		<Card withBorder my={8}>
			<Text weight={500} mb={8}>{title}</Text>
			<pre style={{margin: 0, overflow: 'auto'}} dangerouslySetInnerHTML={{__html: (new AnsiUp()).ansi_to_html(log?.length ? log : 'No logs yet...')}} />
		</Card>
	)
}

export default function Run() {
	const router = useRouter()
	const {workspaceId, runId} = router.query
	const [run, loading, error] = useDocumentData(doc(getFirestore(), 'workspaces', (workspaceId ?? 'undefined').toString(), 'runs', (runId ?? 'undefined').toString()))
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
			<Button radius='xl' leftIcon={<MdArrowBack />} variant='light' mb={8} onClick={() => { router.push(`/workspaces/${workspaceId}`) }}>Back to Workspace</Button>
			<Group>
				<Title order={3}>{run.timestamp.toDate().toUTCString()}</Title>
				<Badge color={runStatusToMantineColor[run.tfStatus]} size='lg' variant='filled'>{snakeToTitle(run.tfStatus)}</Badge>
			</Group>
			<Group>
				<Text size='sm' color='grey'>{runId}</Text>
				<Text size='sm' color='grey'>{run.tfId}</Text>
			</Group>
			<LogCard title='Plan' log={run.tfPlanLog} />
			<LogCard title='Apply' log={run.tfApplyLog} />
		</Container>

	)
}
