import {Select, SelectItem, TextInput, Text} from '@mantine/core'
import {ReactElement, ReactNode} from 'react'
import {IconType} from 'react-icons'
import {VscDebugConsole} from 'react-icons/vsc'
import {SiPostgresql} from 'react-icons/si'
import {makeForm} from '../components/Workflows/Form'

export type WorkflowSlug = 'hello' | 'sql'

export interface Workflow {
	title: string,
	icon: IconType,
	description: string,
	configurationMessage: ReactNode,
	slug: WorkflowSlug,
	form: (props) => ReactElement
}

const lorumIpsum = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras ac pellentesque ex, ut euismod tellus. Cras lobortis odio sit amet purus auctor luctus. Vivamus porta varius dui id fermentum. Donec non tincidunt mi, sed fermentum tellus. Suspendisse in scelerisque arcu, nec imperdiet magna. Integer suscipit facilisis ligula, id tempor ex tempor ut.'

const regionOptions: SelectItem[] = [
	{value: 'europe-west2', label: 'London, UK'},
	{value: 'europe-west3', label: 'Frankfurt, DE'},
	{value: 'us-central1', label: 'Iowa, US'},
	{value: 'asia-south1', label: 'Mumbai, IN'},
	{value: 'asia-northeast1', label: 'Tokyo, JP'},
]

export const workflows: Workflow[] = [
	{
		title: 'Hello World',
		icon: VscDebugConsole,
		description: lorumIpsum,
		configurationMessage: 'Please configure the hello world thing',
		slug: 'hello',
		form: makeForm({
			slug: 'hello',
			initialVars: {
				name: '',
			},
			validateVars: {},
			fields: (form) => (
				<TextInput
					required
					label='Name'
					placeholder='Bob'
					{...form.getInputProps('name')}
				/>
			),
		}),
	},
	{
		title: 'SQL',
		icon: SiPostgresql,
		description: lorumIpsum,
		configurationMessage: (
			<Text>
				Please specify the configuration for the SQL Instance and Database. <br />
				You can consult the <a href='https://cloud.google.com/sql/pricing' target='_blank' rel='noreferrer'>GCP Documentation</a> for detailed pricing and region information.
			</Text>
		),
		slug: 'sql',
		form: makeForm({
			slug: 'sql',
			initialVars: {
				instance_name: '',
				region: 'europe-west2',
				database_version: 'POSTGRES_13',
				tier: 'db-f1-micro',
				database_name: '',
				username: '',

			},
			validateVars: {},
			fields: (form) => (
				<>
					<TextInput
						mt={20}
						required
						label='Instance Name'
						placeholder='main-instance'
						description='The name of the database "server" instance, this must be unique in your project'
						{...form.getInputProps('instance_name')}
					/>
					<Select
						mt={20}
						required
						label='Instance Region'
						description='The GCP region where the database will be hosted. Consider latency and pricing.'
						data={regionOptions}
						{...form.getInputProps('region')}
					/>
					<Select
						mt={20}
						required
						label='Database Version'
						description='They type and version of the SQL database to use such as PostgreSQL or MySQL.'
						data={[
							{value: 'POSTGRES_13', label: 'PostgreSQL 13'},
							{value: 'POSTGRES_14', label: 'PostgreSQL 14'},
							{value: 'POSTGRES_12', label: 'PostgreSQL 12'},
							{value: 'MYSQL_8_0', label: 'MySQL 8'},
							{value: 'MYSQL_5_7', label: 'MySQL 5.7'},
							{value: 'SQLSERVER_2019_STANDARD', label: 'SQL Server 2019 Standard'},
							{value: 'SQLSERVER_2017_STANDARD', label: 'SQL Server 2017 Standard'},
						]}
						{...form.getInputProps('database_version')}
					/>
					<Select
						mt={20}
						required
						label='Instance Tier / Class'
						description='This configures the virtual hardware of the instance like CPU count and RAM.'
						data={[
							{value: 'db-f1-micro', label: 'F1 Micro (Shared CPU, 0.6GB RAM)'},
							{value: 'db-g1-small', label: 'G1 Small (Shared CPU, 1.7GB RAM)'},
						]}
						{...form.getInputProps('tier')}
					/>
					<TextInput
						mt={20}
						required
						label='Database Name'
						description='The name of a database to be created on the "server".'
						placeholder='USER_DATABASE'
						{...form.getInputProps('database_name')}
					/>
					<TextInput
						mt={20}
						required
						label='User Username'
						description='The username of the first database user.'
						placeholder='admin'
						{...form.getInputProps('username')}
					/>
					<TextInput
						mt={20}
						disabled
						label='User Password'
						description='The password of the first database user.'
						value='A secure password will be randomly generated.'
					/>
				</>
			),
		}),
	},

]

export type SlugMap = {[key in WorkflowSlug]: Workflow}

export const slugMap: SlugMap = workflows.reduce((acc, w) => ({...acc, [w.slug]: w}), {}) as SlugMap
