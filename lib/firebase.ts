import {getApps, initializeApp} from 'firebase/app'

if (getApps().length < 1) {
	initializeApp({
		// cspell:disable-next-line
		apiKey: 'AIzaSyBo8BcPTQ-QnIMDQc-oZWBDDBXuTnyZMqY',
		// cspell:disable-next-line
		authDomain: 'clearpathcloud.firebaseapp.com',
		projectId: 'clearpathcloud',
		// cspell:disable-next-line
		storageBucket: 'clearpathcloud.appspot.com',
		messagingSenderId: '89417605643',
		appId: '1:89417605643:web:38f1e5dca2c7358b12dd0e',
	})
}
