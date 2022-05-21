import {RunAttributes} from '@skorfmann/terraform-cloud'
import {Timestamp} from 'firebase/firestore'
import {DefaultMantineColor} from '@mantine/core'

export type RunStatus = RunAttributes['status'] | undefined

// export const tfStatusToLabel: {[key in RunStatus]: string} = {
// 	new: 'Undeployed',
// 	changing: 'Changing',
// 	error: 'Error',
// 	stable: 'Stable',
// }

export const runStatusToMantineColor: {[key in RunStatus]: DefaultMantineColor} = {
	pending: 'gray',
	plan_queued: 'grape',
	planning: 'indigo',
	planned: 'orange',
	cost_estimating: 'orange',
	cost_estimated: 'orange',
	policy_checking: 'orange',
	policy_override: 'orange',
	policy_soft_failed: 'orange',
	policy_checked: 'orange',
	confirmed: 'orange',
	planned_and_finished: 'green',
	apply_queued: 'cyan',
	applying: 'blue',
	applied: 'green',
	discarded: 'red',
	errored: 'red',
	canceled: 'red',
	force_canceled: 'red',
}

export const runStatusToTimelineIndex: {[key in RunStatus]: 0 | 1 | 2 | 3} = {
	pending: 0,
	plan_queued: 0,
	planning: 1,
	planned: 2,
	cost_estimating: 2,
	cost_estimated: 2,
	policy_checking: 2,
	policy_override: 2,
	policy_soft_failed: 2,
	policy_checked: 2,
	confirmed: 2,
	planned_and_finished: 3,
	apply_queued: 2,
	applying: 2,
	applied: 3,
	discarded: 3,
	errored: 3,
	canceled: 3,
	force_canceled: 3,
}

// export const workspaceStateToHelpText: {[key in WorkspaceState]: string} = {
// 	new: 'The workspace has been created and configured. All the variables have been set. '
// 		+ 'It is now ready for deployment. To deploy the infrastructure and apply changes to Google Cloud please press the "Deploy" button.',
// 	changing: 'A Terraform run is in progress. Changes are being made to the infrastructure. '
// 		+ 'To see detailed status of the run select the latest run (in progress) below.',
// 	error: 'An error has ocurred, please check the logs and try again.',
// 	stable: 'Everything is running as expected.',
// }

// export const workspaceStateToApplyText: {[key in WorkspaceState]: string} = {
// 	new: 'Deploy',
// 	changing: '[ERROR]',
// 	error: 'Try Again',
// 	stable: 'Apply Changes',
// }

export interface Run {
	timestamp: Timestamp,
	tfPlanLog?: string,
	tfApplyLog?: string,
	tfId: string | undefined,
	tfStatus: RunStatus,
	outputs?: {
		[key: string]: string | number
	}
}
