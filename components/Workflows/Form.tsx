import {Button, Alert, Group, Center, TextInput, Loader} from '@mantine/core'
import {useForm} from '@mantine/form'
import {UseFormInput, UseFormReturnType} from '@mantine/form/lib/use-form'
import {showNotification, updateNotification} from '@mantine/notifications'
import {getFirestore, collection, addDoc, doc, updateDoc} from 'firebase/firestore'
import {ReactChild, useEffect} from 'react'
import {useDocumentDataOnce} from 'react-firebase-hooks/firestore'
// eslint-disable-next-line import/no-cycle
import {WorkflowSlug} from '../../lib/workflows'
// eslint-disable-next-line import/no-cycle
import {Workspace} from '../../lib/workspace'

interface FormConfig<V> {
	slug: WorkflowSlug,
	initialVars: V,
	validateVars: UseFormInput<V>['validate'],
	fields: (form: UseFormReturnType<V>) => ReactChild,

}

interface FormProps {
	id?: string,
	onSubmitted: (workflowUrl: string) => void,
}

export const makeForm = <V extends Workspace['vars']>(formConfig: FormConfig<V>) => function ConfiguredForm({id, onSubmitted}: FormProps) {
	const db = getFirestore()

	const isEdit = !!id

	const form = useForm<V & {workspaceName: string}>({
		initialValues: {
			workspaceName: '',
			...formConfig.initialVars,
		},
		validate: {
			workspaceName: (value) => (/^[a-zA-Z-_0-9]*$/.test(value) ? null : 'Workspace must only contain characters, numbers, _ or -'),
			...formConfig.validateVars,
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		} as any,
	})

	let loading = isEdit
	let error
	let workspaceData

	if (isEdit) {
		// eslint-disable-next-line react-hooks/rules-of-hooks
		[workspaceData, loading, error] = useDocumentDataOnce(doc(db, 'workspaces', id))
		// eslint-disable-next-line react-hooks/rules-of-hooks
		useEffect(() => {
			if (!loading) {
				form.setValues({
					workspaceName: workspaceData.name,
					...workspaceData.vars,
				})
			}
		// eslint-disable-next-line react-hooks/exhaustive-deps
		}, [loading])
	}

	if (loading) {
		return (
			<Center mt={24}>
				<Loader size='xl' />
			</Center>
		)
	}

	if (isEdit && (error || !workspaceData)) {
		return (
			<Center mt={24}>
				<Alert title='Error' color='red'>
					{error ? error.message : 'Invalid workspace id'}
				</Alert>
			</Center>
		)
	}

	async function onSubmit(values: typeof form.values) {
		const {workspaceName, ...vars} = values

		if (isEdit) {
			showNotification({
				id: 'updatingWorkspace',
				loading: true,
				message: 'Updating workspace...',
				autoClose: false,
			})

			const workspaceUpdate: Partial<Workspace> = {
				state: 'altered',
				vars,
			}
			await updateDoc(doc(db, 'workspaces', id), workspaceUpdate)

			updateNotification({
				id: 'updatingWorkspace',
				loading: false,
				color: 'green',
				message: 'Workspace updated!',
			})

			onSubmitted(`/workspaces/${id}`)
		} else {
			showNotification({
				id: 'updatingWorkspace',
				loading: true,
				message: 'Creating workspace...',
				autoClose: false,
			})

			const initialWorkspaceState: Partial<Workspace> = {
				name: workspaceName,
				state: 'new',
				type: formConfig.slug,
				vars,
			}

			const workspace = await addDoc(
				collection(db, 'workspaces'),
				initialWorkspaceState,
			)

			const response = await fetch('/api/createWorkspace', {
				method: 'POST',
				body: workspace.id,
			})
			const tfId: Workspace['tfId'] = await response.text()

			await updateDoc(workspace, {
				tfId,
			})

			updateNotification({
				id: 'updatingWorkspace',
				loading: false,
				color: 'green',
				message: 'Workspace created!',
			})

			onSubmitted(`/workspaces/${workspace.id}`)
		}
	}

	return (
		<form onSubmit={form.onSubmit(onSubmit)}>

			{!isEdit && (
				<TextInput
					required
					label='Workspace Name'
					description='This is what this deployment will be called in the dashboard'
					placeholder='Team-Project-0'
					{...form.getInputProps('workspaceName')}
				/>
			)}

			{formConfig.fields(form)}

			<Group position='right' mt={24}>
				<Button type='submit' fullWidth>Submit</Button>
			</Group>
		</form>

	)
}
