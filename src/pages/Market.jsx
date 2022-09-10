import { useState, useEffect, useMemo } from 'react'
import styled from '@emotion/styled'
import { FaCaretUp, FaCaretDown } from 'react-icons/fa'
import Chart from 'react-apexcharts'

const priceUrl =
	'https://min-api.cryptocompare.com/data/v2/histohour?fsym=BTC&tsym=USD&limit=200'
async function getPrice() {
	const response = await fetch(priceUrl)
	return response.json()
}

const chartOptions = {
	chart: {
		type: 'candlestick',
		height: 350,
		zoom: {
			enabled: true,
			type: 'x',
			autoScaleYaxis: true,
			zoomedArea: {
				fill: {
					color: '#90CAF9',
					opacity: 0.4,
				},
				stroke: {
					color: '#0D47A1',
					opacity: 0.4,
					width: 1,
				},
			},
		},
	},
	title: {
		text: 'CandleStick Chart',
		align: 'left',
		offsetX: -10,
	},
	xaxis: {
		type: 'datetime',
	},
	yaxis: {
		tickAmount: 4,
		labels: {
			show: true,
			align: 'right',
			minWidth: 0,
			maxWidth: 160,
			style: {
				colors: [],
				fontSize: '12px',
				fontFamily: 'Helvetica, Arial, sans-serif',
				fontWeight: 400,
				cssClass: 'apexcharts-yaxis-label',
			},
			offsetX: -10,
			offsetY: 0,
			rotate: 0,
		},
		tooltip: {
			enabled: true,
			offsetX: -30,
		},
	},
	grid: {
		show: true,
		borderColor: 'rgba(255,255,255,0.5)',
		strokeDashArray: 2,
		position: 'back',
		yaxis: {
			lines: {
				show: true,
			},
		},
		padding: {
			top: 10,
			right: 0,
			bottom: 10,
			left: 10,
		},
	},
	tooltip: {
		theme: 'dark',
	},
}

const colourSet = {
	bull: 'yellowgreen',
	bear: 'red',
}

const PageContainer = styled.div`
	* {
		margin: 0;
	}
	width: 100%;
	height: 100%;
	display: flex;
	flex-direction: column;
	gap: 1rem;

	hr {
		background-color: #333;
		border: none;
		height: 0.1rem;
	}
	/* padding: 1rem; */
`

const TitleContainer = styled.div`
	color: #555;
	padding: 1.5rem 0.5rem 0.5rem 0.5rem;
	display: flex;
	align-items: center;
	gap: 0.75rem;
	h1 {
		font-size: 1.25rem;
	}
	span {
		background-color: #222;
		font-size: 0.75rem;
		padding: 0.25rem 0.5rem;
		border-radius: 0.25rem;
		color: ${(props) =>
			props.trend === 'bull'
				? colourSet.bull
				: props.trend === 'bear'
				? colourSet.bear
				: 'white'};
	}
`

const PriceContainer = styled.div`
	padding: 0.5rem;
	color: ${(props) =>
		props.trend === 'bull'
			? colourSet.bull
			: props.trend === 'bear'
			? colourSet.bear
			: 'white'};

	display: flex;
	flex-direction: column;
`

const PriceText = styled.h2`
	font-size: 1.5rem;
	margin: 0.25rem 0 0.25rem 0;
`

const PriceTimeText = styled.p`
	font-size: 0.5rem;
	margin: 0;
`

const LabelText = styled.span`
	font-size: 0.75rem;
	margin: 0;
`

export default function Market() {
	const [series, setSeries] = useState([
		{
			data: [
				{
					x: new Date(0).toLocaleString('en-US'),
					y: [0, 0, 0, 0],
				},
			],
		},
	])
	const [currentPrice, setCurrentPrice] = useState({
		price: 0,
		priceTime: 0,
	})
	const [prevPrice, setPrevPrice] = useState({
		price: 0,
		priceTime: 0,
	})
	const [ratio, setRatio] = useState(0)

	useEffect(() => {
		let timeoutId
		async function getLatestPrice() {
			try {
				const data = await getPrice()
				const btcPrice = data.Data.Data

				setCurrentPrice({
					price: btcPrice[btcPrice.length - 1].close.toFixed(2),
					priceTime: btcPrice[btcPrice.length - 1].time,
				})
				setPrevPrice({
					price: btcPrice[btcPrice.length - 2].close.toFixed(2),
					priceTime: btcPrice[btcPrice.length - 2].time,
				})

				const prices = btcPrice.map((price, index) => ({
					x: new Date(price.time * 1000).toLocaleString('en-US'),
					y: [price.open, price.high, price.low, price.close],
				}))

				setRatio((prevState) =>
					(
						(btcPrice[btcPrice.length - 1].close /
							btcPrice[btcPrice.length - 2].close) *
							100 -
						100
					).toFixed(2),
				)
				setSeries((prevState) => [{ data: prices }])
			} catch (error) {
				console.log(error)
			}

			timeoutId = setTimeout(getLatestPrice, 5000)
		}
		getLatestPrice()

		return () => {
			clearTimeout(timeoutId)
		}
	}, [currentPrice.price, prevPrice.price])

	const direction = useMemo(
		() =>
			currentPrice.price >= prevPrice.price
				? 'bull'
				: currentPrice.price <= prevPrice.price
				? 'bear'
				: '',
		[currentPrice.price, prevPrice.price],
	)

	return (
		<PageContainer>
			<TitleContainer trend={direction}>
				<h1>BTC/USDT</h1>
				<span>{Math.sign(ratio) === -1 ? ratio : `+${ratio}`}%</span>
			</TitleContainer>

			<hr />

			<div style={{ display: 'flex', gap: '0.5rem' }}>
				<PriceContainer trend={direction}>
					<LabelText>LATEST</LabelText>
					<PriceText>
						{currentPrice.price}
						{direction === 'bull' ? (
							<FaCaretUp />
						) : direction === 'bear' ? (
							<FaCaretDown />
						) : (
							'-'
						)}
					</PriceText>
					<PriceTimeText>
						{new Date(currentPrice.priceTime * 1000).toLocaleString('en-US')}
					</PriceTimeText>
				</PriceContainer>

				<PriceContainer trend={direction}>
					<LabelText>PREVIOUS</LabelText>
					<PriceText>{prevPrice.price}</PriceText>
					<PriceTimeText>
						{new Date(prevPrice.priceTime * 1000).toLocaleString('en-US')}
					</PriceTimeText>
				</PriceContainer>
			</div>

			<hr />

			<div style={{ padding: '0.5rem' }}>
				<Chart
					options={chartOptions}
					series={series}
					type="candlestick"
					width="100%"
					height={320}
				/>
			</div>
		</PageContainer>
	)
}
