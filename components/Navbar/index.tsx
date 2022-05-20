import {Button} from '@mantine/core'
import {getAuth, signOut} from 'firebase/auth'
import {useAuthState} from 'react-firebase-hooks/auth'
import {HeaderMiddle} from './_MantineNavbar'

export default function Navbar() {
	const auth = getAuth()
	const [user] = useAuthState(auth)
	return (
		<HeaderMiddle
			links={user ? [
				{label: 'Dashboard', link: '/'},
			] : []}
			cta={user && (
				<Button radius='xl' variant='outline' sx={{height: 30}} onClick={() => { signOut(auth) }}>
					Logout
				</Button>
			)}
		/>
	)
}
