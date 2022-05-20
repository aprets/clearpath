import {Button, Text, Container, Image, Group, Stack, Blockquote, Divider, Grid, Input, Center, Loader, Paper, Badge, Title} from '@mantine/core'
import {useRouter} from 'next/router'

import {useAuthState} from 'react-firebase-hooks/auth'
import {getAuth, EmailAuthProvider, signInWithEmailAndPassword} from 'firebase/auth'
import {useEffect, useRef} from 'react'
import {showNotification} from '@mantine/notifications'
import Link from 'next/link'
import {useCollection} from 'react-firebase-hooks/firestore'
import {collection, getFirestore} from 'firebase/firestore'
import {Workspace, workspaceStateToLabel, workspaceStateToMantineColor} from '../lib/workspace'
import {slugMap} from '../lib/workflows'

export default function Dashboard() {
	const router = useRouter()
	const auth = getAuth()
	const [user] = useAuthState(auth)
	const [rawWorkspaces, loading] = useCollection(collection(getFirestore(), 'workspaces'))
	const workspaces = rawWorkspaces?.docs?.map((s) => ({id: s.id, ...s.data() as Workspace}))
	if (loading) {
		return (
			<Center mt={24}>
				<Loader size='xl' />
			</Center>
		)
	}
	return (
		<>
			<code>{router.asPath}</code>
			<br />
			<code>{JSON.stringify(user)}</code>
			<Container size={1920} mt={8}>
				<Group position='apart'>
					<Title order={3}>Availible Workspaces</Title>
					<Link href='/new' passHref>
						<Button component='a'>New</Button>
					</Link>
				</Group>
				{workspaces.map((workspace) => (
					<Link key={workspace.id} href={`/workspaces/${workspace.id}`} passHref>
						<Paper key={workspace.id} component='a' withBorder p='md' my={10}>
							<Group position='apart'>
								<Text weight={500}>[{slugMap[workspace.type].title}] {workspace.name}</Text>
								<Badge color={workspaceStateToMantineColor[workspace.state]} size='lg' variant='filled'>{workspaceStateToLabel[workspace.state]}</Badge>
							</Group>
						</Paper>
					</Link>
				))}
			</Container>
		</>

	)
}
