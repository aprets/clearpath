import {Button, Container, Input} from '@mantine/core'

import {useAuthState} from 'react-firebase-hooks/auth'
import {getAuth, signInWithEmailAndPassword} from 'firebase/auth'
import {ReactElement, useRef} from 'react'
import {showNotification} from '@mantine/notifications'

export default function GateKeeper({children}: {children: ReactElement}) {
	const auth = getAuth()
	const [user] = useAuthState(auth)
	const userRef = useRef<HTMLInputElement>()
	const passwordRef = useRef<HTMLInputElement>()
	const login = () => {
		const email = `${userRef.current?.value}@clearpathcloud.web.app`
		const password = passwordRef.current?.value
		signInWithEmailAndPassword(auth, email, password)
			.catch((authError) => {
				showNotification({
					color: 'red',
					title: 'Error',
					message: authError.code,
				})
			})
	}
	if (user) {
		return children
	}
	return (
		<Container mt={16}>
			<Input
				ref={userRef}
				type='text'
				placeholder='Username'
				defaultValue='user'
				onKeyDown={(event) => {
					if (event.key === 'Enter') login()
				}}
				mb={8}
			/>
			<Input
				ref={passwordRef}
				type='password'
				placeholder='Password'
				defaultValue='password'
				onKeyDown={(event) => {
					if (event.key === 'Enter') login()
				}}
				mb={8}
			/>
			<Button fullWidth onClick={login}>Enter</Button>
		</Container>
	)
}
