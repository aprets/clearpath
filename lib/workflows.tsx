import {Select, SelectItem, TextInput, Text} from '@mantine/core'
import {ReactElement, ReactNode} from 'react'
import {IconType} from 'react-icons'
import {VscDebugConsole} from 'react-icons/vsc'
import {SiDocker, SiPostgresql, SiVirtualbox} from 'react-icons/si'
import {makeForm} from '../components/Workflows/Form'

export type WorkflowSlug = 'hello' | 'sql' | 'cloudrun' | 'vm'

export interface Workflow {
	title: string,
	icon: IconType,
	description: ReactNode,
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
		description: (
			<>
				This workflow deploys a simple &quot;Hello World&quot; project.
				It deploys no real infrastructure and incurs no cost.
				<br /><br />Instead this takes a &quot;name&quot; variable and generates &quot;Hello *name*&quot; as an output
				in addition to outputting a random HEX string. This workflow is meant for you to test the platform
				and its functionality. It allows you to deploy, change and destroy &quot;infrastructure&quot; without
				actually deploying anything, incurring any costs or risking making any unintended changes.
			</>
		),
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
		description: (
			<>
				Deploys an SQL Database instance (virtual server), also creating the first SQL Database
				and an administrator user. You can choose between PostgreSQL, MySQL or SQL Server to suit your needs.
				<br /><br />The SQL database has long been the tried and tested workhorse of the backend enterprise
				It performs very well with relational data, but is less scalable and flexible than its NoSQL counterparts.
				This workflow will create a Google Cloud Managed SQL Instance of your desired configuration in your desired
				location.
			</>
		),
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
	{
		title: 'Container',
		icon: SiDocker,
		description: (
			<>
				Deploys a fully managed, autoscaling (Docker) container. If your application can be
				containerized or is already a container, this will likely be the most performant, efficient and economical
				runtime
				<br /><br /> In the past decade, Docker containers gained a lot of popularity.
				They allow you to packages up code and all its dependencies into a standardized container,
				so the application runs quickly and reliably from one computing environment to another.
				Compared to Virtual Machines, Docker does not virtualize much of the hardware and uses parts
				of the host Operating System (Kernel) which allows for smaller images, fast startup and run with very low overhead.
				This workflow runs your container on Google Cloud Run, a modern cloud-native container runtime.
			</>
		),
		configurationMessage: (
			<Text>
				Please specify the configuration for the Cloud Run service to deploy. <br />
				You can consult the <a href='https://cloud.google.com/run/docs' target='_blank' rel='noreferrer'>GCP Documentation</a> for detailed pricing, runtime and region information.
			</Text>
		),
		slug: 'cloudrun',
		form: makeForm({
			slug: 'cloudrun',
			initialVars: {
				service_name: '',
				region: 'europe-west2',

			},
			validateVars: {},
			fields: (form) => (
				<>
					<TextInput
						mt={20}
						required
						label='Service Name'
						placeholder='main-website'
						description='The name of the Cloud Run service that will run and scale your container, this must be unique in your project'
						{...form.getInputProps('service_name')}
					/>
					<Select
						mt={20}
						required
						label='Service Region'
						description='The GCP region where the service will run the containers. Consider latency and pricing.'
						data={regionOptions}
						{...form.getInputProps('region')}
					/>
				</>
			),
		}),
	},
	{
		title: 'Virtual Machine',
		icon: SiVirtualbox,
		description: (
			<>
				This lets you deploy a fully managed, Virtual Machine. The VM will be provided with private
				and public IP addresses and a built-in firewall. If you application can be containerized, a container
				runtime will be more economical and performant if you can use it.
				<br /><br /> Virtual Machines are a virtual (software) implementation of a physical server.
				They emulate hardware allowing the OS to run like on a physical computer. Compared to a physical server, the VM can be stopped,
				cloned, restored from backup or deleted at any time. You only pay for the resources you need and can scale them up at any time.
				This gives you all the flexibility of a physical server, but might be less economical than a container in the long term.
				This workflow uses Google Compute Engine.
			</>
		),
		configurationMessage: (
			<Text>
				Please specify the configuration for the Compute Engine instance. <br />
				You can consult the <a href='https://cloud.google.com/compute/docs' target='_blank' rel='noreferrer'>GCP Documentation</a> for detailed pricing and region information.
			</Text>
		),
		slug: 'vm',
		form: makeForm({
			slug: 'vm',
			initialVars: {
				instance_name: '',
				region: 'europe-west2-a',
				machine_type: 'e2-micro',
				image: 'ubuntu-2204-jammy-v20220506',
			},
			validateVars: {},
			fields: (form) => (
				<>
					<TextInput
						mt={20}
						required
						label='Instance Name'
						placeholder='main-instance'
						description='The name of the GCE instance, this must be unique in your project'
						{...form.getInputProps('instance_name')}
					/>
					<Select
						mt={20}
						required
						label='Instance Region'
						description='The GCP region where the Virtual Machine will run. Consider latency and pricing.'
						data={[
							{value: 'europe-west2-a', label: 'London, UK'},
							{value: 'europe-west3-a', label: 'Frankfurt, DE'},
							{value: 'us-central1-a', label: 'Iowa, US'},
							{value: 'asia-south1-a', label: 'Mumbai, IN'},
							{value: 'asia-northeast1-a', label: 'Tokyo, JP'},
						]}
						{...form.getInputProps('region')}
					/>
					<Select
						mt={20}
						required
						label='Machine Type'
						description='This configures the virtual hardware of the instance like CPU count and RAM.'
						data={[
							{value: 'e2-micro', label: 'Tiny (1/4 Shared CPU, 1GB RAM)'},
							{value: 'e2-small', label: 'Very Small (1/2 Shared CPU, 2GB RAM)'},
							{value: 'e2-medium', label: 'Small (1 Shared CPU, 2GB RAM)'},
							{value: 'e2-standard-2', label: 'Medium (2 CPU, 8GB RAM)'},
							{value: 'e2-standard-4', label: 'Large (4 CPU, 16GB RAM)'},
						]}
						{...form.getInputProps('machine_type')}
					/>
					<Select
						mt={20}
						required
						label='Image'
						description='The Operating System Image to run on the VM.'
						data={[
							{value: 'debian-10-buster-v20220519', label: 'Debian 10 Buster'},
							{value: 'ubuntu-2204-jammy-v20220506', label: 'Ubuntu 22.04 Jammy LTS'},
							{value: 'ubuntu-2004-focal-v20220419', label: 'Ubuntu 20.04 Focal LTS'},
							{value: 'ubuntu-1804-bionic-v20220505', label: 'Ubuntu 18.04 Bionic LTS'},
							{value: 'windows-server-2022-dc-v20220513', label: 'Windows Server 2022'},
							{value: 'windows-server-2019-dc-v20220513', label: 'Windows Server 2019'},
							{value: 'windows-server-2016-dc-core-v20220513', label: 'Windows Server 2016'},
						]}
						{...form.getInputProps('image')}
					/>

				</>
			),
		}),
	},

]

export type SlugMap = {[key in WorkflowSlug]: Workflow}

export const slugMap: SlugMap = workflows.reduce((acc, w) => ({...acc, [w.slug]: w}), {}) as SlugMap
