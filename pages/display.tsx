import AnsiUp from 'ansi_up'

import fs from 'fs'
import {GetStaticProps} from 'next'

export default function Ge({data}) {
	return (
		<pre dangerouslySetInnerHTML={{__html: (new AnsiUp()).ansi_to_html(data)}} />
	)
}

export const getStaticProps: GetStaticProps = async () => ({
	props: {
		data: fs.readFileSync('./log.txt', 'utf-8'),
	},
})
