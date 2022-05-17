import {Button} from '@mantine/core'
import {HeaderMiddle} from './_MantineNavbar'

export default function Navbar() {
	return (
		<HeaderMiddle
			links={[
				{label: 'Dashboard', link: '/'},
			]}
			cta={(
				<>
					<Button radius='xl' sx={{height: 30}}>
						Big
					</Button>
					<Button radius='xl' sx={{height: 30}}>
						Chongus
					</Button>
				</>
			)}
		/>
	)
}
