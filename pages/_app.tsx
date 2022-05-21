import {AppProps} from 'next/app'
import Head from 'next/head'
import {MantineProvider} from '@mantine/core'
import {NotificationsProvider} from '@mantine/notifications'
import {ModalsProvider} from '@mantine/modals'
import Navbar from '../components/Navbar'

import '../global.css'
import '../lib/firebase'
import GateKeeper from '../components/GateKeeper'

export default function App(props: AppProps) {
	const {Component, pageProps} = props

	return (
		<>
			<Head>
				<title>ClearPath Alpha</title>
				<meta name='viewport' content='minimum-scale=1, initial-scale=1, width=device-width' />
				<link rel='apple-touch-icon' sizes='180x180' href='/apple-touch-icon.png' />
				<link rel='icon' type='image/png' sizes='32x32' href='/favicon-32x32.png' />
				<link rel='icon' type='image/png' sizes='16x16' href='/favicon-16x16.png' />
				<link rel='manifest' href='/site.webmanifest' />
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
