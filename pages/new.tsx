import {Button, Text, Container, SimpleGrid, Card, ThemeIcon, Center, Box} from '@mantine/core'
import {useState} from 'react'

import {WorkflowModal} from '../components/Workflows/Modal'
import {Workflow, workflows} from '../lib/workflows'

function WorkflowCard(workflow: Workflow) {
	const [opened, setOpened] = useState(false)
	return (
		<Card key={workflow.slug} shadow='sm' p='lg' withBorder sx={{display: 'flex', flexDirection: 'column'}}>
			<Card.Section mt={8}>
				<Center>
					<ThemeIcon sx={{width: '30%', height: 'auto'}}>
						<workflow.icon size='100%' style={{margin: 20}} />
					</ThemeIcon>
				</Center>
			</Card.Section>

			<Text weight={500} mt={8}>{workflow.title}</Text>
			<Text size='sm'>{workflow.description}</Text>

			<WorkflowModal opened={opened} setOpened={setOpened} type={workflow.slug} redirectOnSubmit />

			<Box mt='auto'>
				<Button variant='light' fullWidth mt={14} onClick={() => setOpened(true)}>
					Deploy
				</Button>
			</Box>
		</Card>
	)
}

export default function New() {
	return (
		<Container size={1920} mt={8}>
			<SimpleGrid
				cols={4}
				spacing='lg'
				breakpoints={[
					{maxWidth: 980, cols: 3, spacing: 'md'},
					{maxWidth: 755, cols: 2, spacing: 'sm'},
					{maxWidth: 600, cols: 1, spacing: 'sm'},
				]}
			>
				{workflows.map((workflow) => <WorkflowCard key={workflow.slug} {...workflow} />)}
			</SimpleGrid>
		</Container>

	)
}
