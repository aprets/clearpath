import {Modal, Text} from '@mantine/core'
import {useRouter} from 'next/router'
import {Dispatch, SetStateAction} from 'react'

import {WorkflowSlug, slugMap} from '../../lib/workflows'

export function WorkflowModal(
	{
		opened,
		setOpened,
		type,
		id,
		redirectOnSubmit,
	}: {
		opened: boolean,
		setOpened: Dispatch<SetStateAction<boolean>>,
		type: WorkflowSlug,
		id?: string,
		redirectOnSubmit?: boolean
	},
) {
	const router = useRouter()
	const workflow = slugMap[type]
	return (
		<Modal
			size='xl'
			title={`${workflow.title} Configuration`}
			opened={opened}
			onClose={() => setOpened(false)}
		>
			<Text mb={24} size='md' color='gray'>
				{workflow.configurationMessage}
			</Text>
			<workflow.form
				id={id}
				onSubmitted={(workflowUrl) => {
					if (redirectOnSubmit) {
						router.push(workflowUrl)
					} else {
						setOpened(false)
					}
				}}
			/>
		</Modal>
	)
}
