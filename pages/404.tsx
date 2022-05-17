import {Title, Text, Container, Image, Group, Stack, Blockquote, Divider} from '@mantine/core'
import {useRouter} from 'next/router'

export default function AboutUsPage() {
	const router = useRouter()
	return (
		<>
			<code>{router.asPath}</code>
			<Text my={20} size='lg' color='gray'>
				Mamam mia mario what have you done
			</Text>
		</>

	)
}
