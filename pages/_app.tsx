import {AppProps} from 'next/app'
import Head from 'next/head'
import {MantineProvider} from '@mantine/core'
import {NotificationsProvider} from '@mantine/notifications'
import Navbar from '../components/Navbar'
import {theme} from '../lib/theme'

import '../global.css'
import '../lib/firebase'
import {useStoreHydrate} from '../lib/store/storage'

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
				theme={theme}
			>
				<NotificationsProvider position='bottom-left'>
					<Navbar />
					<Component {...pageProps} />
				</NotificationsProvider>
			</MantineProvider>
		</>
	)
}
