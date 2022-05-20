import {AppProps} from 'next/app'
import Head from 'next/head'
import {MantineProvider} from '@mantine/core'
import {NotificationsProvider} from '@mantine/notifications'
import {ModalsProvider} from '@mantine/modals'
import Navbar from '../components/Navbar'

import '../global.css'
import '../lib/firebase'
import {useStoreHydrate} from '../lib/store/storage'
import GateKeeper from '../components/GateKeeper'

export default function App(props: AppProps) {
	const {Component, pageProps} = props

	useStoreHydrate()

	return (
		<>
			<Head>
				<title>ClearPath Alpha</title>
				<meta name='viewport' content='minimum-scale=1, initial-scale=1, width=device-width' />
			</Head>

			<MantineProvider
				withGlobalStyles
				withNormalizeCSS
			>
				<NotificationsProvider position='top-right'>
					<ModalsProvider>
						<Navbar />
						<GateKeeper>
							<Component {...pageProps} />
						</GateKeeper>
					</ModalsProvider>
				</NotificationsProvider>
			</MantineProvider>
		</>
	)
}
