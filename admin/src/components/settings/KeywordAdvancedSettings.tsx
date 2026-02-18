// "use client";

// import React, { useState, useEffect } from "react";
// import {
// 	Accordion,
// 	AccordionHeader,
// 	AccordionBody,
// 	Typography,
// 	Switch,
// } from "@material-tailwind/react";
// import MonitorIntervalSlider from "./MonitorIntervalSlider";
// import { getUserDetailsCached } from "@/utils/userStorage";
// import { PLAN_TYPES } from "@/constants/constant";

// interface KeywordAdvancedSettingsProps {
// 	timeout: number;
// 	onTimeoutChange: (timeout: number) => void;
// 	followRedirects: boolean;
// 	onFollowRedirectsChange: (followRedirects: boolean) => void;
// 	matchAll: boolean;
// 	onMatchAllChange: (matchAll: boolean) => void;
// 	monitorInterval: number;
// 	onMonitorIntervalChange: (value: number) => void;
// }

// function ChevronIcon({ open }: { open: boolean }) {
// 	return (
// 		<svg
// 			xmlns="http://www.w3.org/2000/svg"
// 			fill="none"
// 			viewBox="0 0 24 24"
// 			strokeWidth={2}
// 			stroke="currentColor"
// 			className={`tw-h-5 tw-w-5 tw-transition-transform ${
// 				open ? "tw-rotate-180" : ""
// 			}`}
// 		>
// 			<path
// 				strokeLinecap="round"
// 				strokeLinejoin="round"
// 				d="M19.5 8.25l-7.5 7.5-7.5-7.5"
// 			/>
// 		</svg>
// 	);
// }

// export default function KeywordAdvancedSettings({
// 	timeout,
// 	onTimeoutChange,
// 	followRedirects,
// 	onFollowRedirectsChange,
// 	matchAll,
// 	onMatchAllChange,
// 	monitorInterval,
// 	onMonitorIntervalChange,
// }: KeywordAdvancedSettingsProps) {
// 	const [open, setOpen] = useState(false);
// 	const min = 5;
// 	const max = 60;

// 	const [minMonitoringInterval, setMinMonitoringInterval] = useState(60);
// 	const [userPlan, setUserPlan] = useState(PLAN_TYPES.TRIAL);

// 	useEffect(() => {
// 		async function fetchUser() {
// 			try {
// 				const details = await getUserDetailsCached(true);
// 				const userMinMonitoringIntervalInMins =
// 					details?.plan_limits?.min_monitoring_interval;
// 				setMinMonitoringInterval(
// 					userMinMonitoringIntervalInMins
// 						? userMinMonitoringIntervalInMins * 60
// 						: 60
// 				);
// 				setUserPlan(
// 					details?.user?.subscription_type || PLAN_TYPES.TRIAL
// 				);
// 			} catch (error) {
// 				console.error(
// 					"Failed to fetch user details in KeywordAdvancedSettings",
// 					error
// 				);
// 			}
// 		}
// 		fetchUser();
// 	}, []);

// 	const getPercent = (value: number) => ((value - min) / (max - min)) * 100;

// 	return (
// 		<Accordion
// 			open={open}
// 			className="tw-border tw-border-gray-200 tw-rounded-lg"
// 		>
// 			<AccordionHeader
// 				onClick={() => setOpen(!open)}
// 				className="tw-border-none tw-p-4 hover:tw-text-gray-900"
// 			>
// 				<div className="tw-flex tw-items-center tw-gap-3">
// 					<ChevronIcon open={open} />
// 					<Typography
// 						variant="h6"
// 						className="tw-font-bold tw-text-gray-900"
// 					>
// 						Advanced settings
// 					</Typography>
// 				</div>
// 			</AccordionHeader>
// 			<AccordionBody className="tw-pt-0 tw-px-4">
// 				{/* Monitor Interval and Request Timeout - Side by Side on larger screens */}
// 				<div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-6 tw-mb-6">
// 					{/* Monitor Interval */}
// 					<div>
// 						<MonitorIntervalSlider
// 							value={monitorInterval}
// 							onChange={onMonitorIntervalChange}
// 							minSeconds={60}
// 							maxSeconds={86400}
// 							minMonitoringInterval={minMonitoringInterval}
// 							userPlan={userPlan}
// 						/>
// 					</div>

// 					{/* Request Timeout */}
// 					<div>
// 						<Typography
// 							variant="h6"
// 							className="tw-font-semibold tw-text-gray-900 tw-mb-0"
// 						>
// 							Request Timeout
// 						</Typography>
// 						<Typography
// 							variant="small"
// 							className="tw-text-gray-600 tw-mb-2"
// 						>
// 							The request timeout is{" "}
// 							<strong>{timeout} seconds</strong>.
// 						</Typography>
// 						<div className="tw-relative tw-pt-1">
// 							<input
// 								type="range"
// 								min={min}
// 								max={max}
// 								step="1"
// 								value={timeout}
// 								onChange={(e) =>
// 									onTimeoutChange(parseInt(e.target.value))
// 								}
// 								className="tw-w-full tw-h-2 tw-bg-blue-200 tw-rounded-lg tw-appearance-none tw-cursor-pointer"
// 								style={{
// 									background: `linear-gradient(
// 										to right,
// 										#2196F3 0%,
// 										#2196F3 ${((timeout - min) / (max - min)) * 100}%,
// 										#E5E7EB ${((timeout - min) / (max - min)) * 100}%,
// 										#E5E7EB 100%
// 									)`,
// 								}}
// 							/>
// 							<div className="tw-relative tw-mt-3 tw-h-4">
// 								{[5, 15, 30, 45, 60].map((value) => (
// 									<span
// 										key={value}
// 										className="tw-absolute tw-text-xs tw-text-gray-500 -tw-translate-x-1/2"
// 										style={{ left: `${getPercent(value)}%` }}
// 									>
// 										{value}s
// 									</span>
// 								))}
// 							</div>
// 						</div>
// 					</div>
// 				</div>

// 				{/* Follow Redirects and Match All Keywords - Side by Side on larger screens */}
// 				<div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-6 tw-mb-4">
// 					{/* Follow Redirects Switch */}
// 					<div>
// 						<div className="tw-flex tw-items-center tw-gap-3 tw-mb-2">
// 							<Switch
// 								checked={followRedirects}
// 								onChange={(e) =>
// 									onFollowRedirectsChange(e.target.checked)
// 								}
// 								color="blue"
// 							/>
// 							<Typography
// 								variant="h6"
// 								className="tw-font-semibold tw-text-gray-900"
// 							>
// 								Follow Redirects
// 							</Typography>
// 						</div>
// 						<Typography variant="small" className="tw-text-gray-600">
// 							Automatically follow HTTP redirects when checking the URL.
// 						</Typography>
// 					</div>

// 					{/* Match All Keywords Switch */}
// 					<div>
// 						<div className="tw-flex tw-items-center tw-gap-3 tw-mb-2">
// 							<Switch
// 								checked={matchAll}
// 								onChange={(e) =>
// 									onMatchAllChange(e.target.checked)
// 								}
// 								color="blue"
// 							/>
// 							<Typography
// 								variant="h6"
// 								className="tw-font-semibold tw-text-gray-900"
// 							>
// 								Match All Keywords
// 							</Typography>
// 						</div>
// 						<Typography variant="small" className="tw-text-gray-600">
// 							All keywords must match for the check to pass. If disabled, matching any keyword is sufficient.
// 						</Typography>
// 					</div>
// 				</div>
// 			</AccordionBody>
// 		</Accordion>
// 	);
// }
