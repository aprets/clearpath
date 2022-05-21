import {Box, Popover, SimpleGrid, Text} from '@mantine/core'
import {useClipboard} from '@mantine/hooks'
import {ReactNode, useState} from 'react'
import {snakeToTitle} from '../lib/text'

export function Sensitive({children}: {children: string}) {
	const clipboard = useClipboard({timeout: 10000})
	const [opened, setOpened] = useState(false)
	return (
		<Popover
			opened={opened}
			onClose={() => setOpened(false)}
			position='bottom'
			placement='center'
			withArrow
			trapFocus={false}
			closeOnEscape={false}
			transition='pop-top-left'
			styles={{body: {pointerEvents: 'none'}}}
			target={(
				<Text
					component='span'
					sx={{color: 'transparent', userSelect: 'none', backgroundColor: '#e8e8e8', cursor: 'pointer', borderRadius: 7}}
					onClick={() => clipboard.copy(children)}
					onMouseEnter={() => setOpened(true)}
					onMouseLeave={() => {
						setOpened(false)
						setTimeout(() => clipboard.reset(), 300)
					}}
				>
					{children}
				</Text>
			)}
		>
			{clipboard.copied ? 'Copied to clipboard!' : 'Click to copy to clipboard'}
		</Popover>

	)
}

export const openInNewWindow = (v) => (e) => {
	e.preventDefault()
	window.open(
		v,
		'newwindow',
		'height=500,width=1000',
	)
	return false
}

// eslint-disable-next-line @typescript-eslint/comma-dangle
export const objectGrid = <T,>(item: T) => (
	<SimpleGrid
		cols={3}
		spacing='lg'
		breakpoints={[
			{maxWidth: 'md', cols: 3, spacing: 'md'},
			{maxWidth: 'sm', cols: 2, spacing: 'sm'},
			{maxWidth: 'xs', cols: 1, spacing: 'sm'},
		]}
		mb={8}
	>
		{item && Object.entries(item).map(([k, v]) => (
			<Box key={k}>
				<Text weight={500}>{snakeToTitle(k.toString())}</Text>
				{(k === 'password' && (
					<Sensitive>
						{v.toString()}
					</Sensitive>
				)) || (k === 'url' && (
					<a href={v} target='_blank' rel='noreferrer'>
						{v.toString()}
					</a>
				)) || (k === 'shell_url' && (
					<a
						href={v}
						onClick={openInNewWindow(v)}
					>
						{v.toString()}
					</a>
				)) || (
					<Text>{v}</Text>
				)}
			</Box>
		))}
	</SimpleGrid>

)
