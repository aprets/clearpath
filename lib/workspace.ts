import {DefaultMantineColor} from '@mantine/core'
import {WorkflowSlug} from './workflows'

export type WorkspaceState = 'new' | 'altered' | 'stable' | 'changing' | 'error'

export const workspaceStateToLabel: {[key in WorkspaceState]: string} = {
	new: 'Undeployed',
	altered: 'Undeployed',
	changing: 'Changing',
	error: 'Error',
	stable: 'Stable',
}

export const workspaceStateToMantineColor: {[key in WorkspaceState]: DefaultMantineColor} = {
	new: 'red',
	altered: 'indigo',
	changing: 'orange',
	error: 'red',
	stable: 'green',
}

export const workspaceStateToHelpText: {[key in WorkspaceState]: string} = {
	new: 'The workspace has been created and configured. All the variables have been set. '
		+ 'It is now ready for deployment. To deploy the infrastructure and apply changes to Google Cloud please press the "Deploy" button.',
	altered: 'The workspace configuration has changed. All the variables have been set. '
		+ 'It is now ready for deployment. To change the infrastructure and apply changes to Google Cloud please press the "Apply Changes" button.',
	changing: 'A Terraform run is in progress. Changes are being made to the infrastructure. '
		+ 'To see detailed status of the run select the latest run (in progress) below.',
	error: 'An error has ocurred, please check the logs and try again.',
	stable: 'Everything is running as expected. You can click "Verify Infrastructure" to check infrastructure state and update it to the specified configuration.',
}

export const workspaceStateToApplyText: {[key in WorkspaceState]: string} = {
	new: 'Deploy',
	altered: 'Apply Changes',
	changing: 'Apply Changes',
	error: 'Try Again',
	stable: 'Verify Infrastructure',
}

export interface Workspace {
	name: string,
	state: WorkspaceState,
	tfId: string,
	type: WorkflowSlug,
	vars: {
		[key: string]: string | number
	}
	outputs: {
		[key: string]: string | number
	}
}
