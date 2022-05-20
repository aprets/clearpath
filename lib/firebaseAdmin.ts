import {getApps, initializeApp, cert} from 'firebase-admin/app'

if (!getApps().length) {
	initializeApp({
		credential: cert(JSON.parse(process.env.GCP_CREDENTIALS)),
	})
}
