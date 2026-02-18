// "use client";

// import React, { useState } from "react";
// import { Button, Input, Switch, Select, Option, Typography } from "@material-tailwind/react";
// import { Keyword } from "@/types/monitor";
// import { TrashIcon } from "@heroicons/react/24/outline";

// interface KeywordInputProps {
// 	keywords: Keyword[];
// 	onKeywordsChange: (keywords: Keyword[]) => void;
// 	error?: string;
// }

// export default function KeywordInput({
// 	keywords,
// 	onKeywordsChange,
// 	error,
// }: KeywordInputProps) {
// 	const [keywordInput, setKeywordInput] = useState("");

// 	const handleAddKeyword = () => {
// 		const trimmedInput = keywordInput.trim();
// 		if (!trimmedInput) return;

// 		const newKeyword: Keyword = {
// 			text: trimmedInput,
// 			type: "must_contain",
// 			case_sensitive: false,
// 			is_regex: false,
// 		};

// 		onKeywordsChange([...keywords, newKeyword]);
// 		setKeywordInput("");
// 	};

// 	const handleRemoveKeyword = (index: number) => {
// 		onKeywordsChange(keywords.filter((_, i) => i !== index));
// 	};

// 	const handleKeywordChange = (
// 		index: number,
// 		field: keyof Keyword,
// 		value: any,
// 	) => {
// 		const updatedKeywords = [...keywords];
// 		updatedKeywords[index] = {
// 			...updatedKeywords[index],
// 			[field]: value,
// 		};
// 		onKeywordsChange(updatedKeywords);
// 	};

// 	const handleKeyPress = (e: React.KeyboardEvent) => {
// 		if (e.key === "Enter") {
// 			e.preventDefault();
// 			handleAddKeyword();
// 		}
// 	};

// 	return (
// 		<div className="tw-space-y-4">
// 			{/* Keyword Input Field */}
// 			<div className="tw-mb-4">
// 				<label className="tw-block tw-text-sm tw-font-semibold tw-text-gray-700 tw-mb-2">
// 					Keywords / Text
// 				</label>
// 				<div className="tw-flex tw-gap-2">
// 					<Input
// 						type="text"
// 						label="Enter keyword"
// 						value={keywordInput}
// 						onChange={(e) => setKeywordInput(e.target.value)}
// 						onKeyPress={handleKeyPress}
// 						className="tw-flex-1"
// 						crossOrigin="anonymous"
// 					/>
// 					<Button
// 						type="button"
// 						onClick={handleAddKeyword}
// 						disabled={!keywordInput.trim()}
// 						className="tw-bg-blue-600 hover:tw-bg-blue-700 tw-whitespace-nowrap"
// 						size="md"
// 					>
// 						+
// 					</Button>
// 				</div>
// 				{error && (
// 					<p className="tw-text-red-600 tw-text-sm tw-mt-1">{error}</p>
// 				)}
// 			</div>

// 			{/* Keywords List */}
// 			{keywords.length > 0 && (
// 				<div className="tw-space-y-3">
// 					<label className="tw-block tw-text-sm tw-font-semibold tw-text-gray-700">
// 						Added Keywords ({keywords.length})
// 					</label>

// 					<div className="tw-space-y-2">
// 						{keywords.map((keyword, index) => (
// 							<div
// 								key={index}
// 								className="tw-p-4 tw-bg-gray-50 tw-border tw-border-gray-200 tw-rounded-lg"
// 							>
// 								{/* Keyword Text and Remove Button */}
// 								<div className="tw-flex tw-items-center tw-justify-between tw-mb-4">
// 									<span className="tw-font-mono tw-text-sm tw-break-all tw-text-gray-800 tw-font-semibold">
// 										{keyword.text}
// 									</span>
// 									<button
// 										type="button"
// 										onClick={() => handleRemoveKeyword(index)}
// 										className="tw-ml-2 tw-text-red-600 hover:tw-text-red-700 tw-font-bold tw-text-lg tw-flex-shrink-0"
// 										title="Remove keyword"
// 									>
// 										<TrashIcon className="tw-w-5 tw-h-5" />
// 									</button>
// 								</div>

// 								{/* Keyword Options */}
// 								<div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-3 tw-gap-4">
// 									{/* Match Type - Per Keyword Dropdown */}
// 									<div>
// 										<Select
// 											value={keyword.type}
// 											onChange={(value) => {
// 												if (value) {
// 													handleKeywordChange(
// 														index,
// 														"type",
// 														value as "must_contain" | "must_not_contain",
// 													);
// 												}
// 											}}
// 											label="Match type"
// 											size="md"
// 										>
// 											<Option value="must_contain">Exists</Option>
// 											<Option value="must_not_contain">Does not exist</Option>
// 										</Select>
// 									</div>

// 									{/* Is Regex Switch */}
// 									<div className="tw-flex tw-flex-col tw-justify-center">
// 										<div className="tw-flex tw-items-center tw-gap-3">
// 											<Switch
// 												checked={keyword.is_regex}
// 												onChange={(e) =>
// 													handleKeywordChange(
// 														index,
// 														"is_regex",
// 														e.target.checked,
// 													)
// 												}
// 												color="blue"
// 											/>
// 											<Typography
// 												variant="small"
// 												className="tw-font-medium tw-text-gray-700"
// 											>
// 												Regex
// 											</Typography>
// 										</div>
// 										<Typography variant="small" className="tw-text-gray-500 tw-text-xs tw-mt-1">
// 											Use regular expression matching
// 										</Typography>
// 									</div>

// 									{/* Case Sensitive Switch */}
// 									<div className="tw-flex tw-flex-col tw-justify-center">
// 										<div className="tw-flex tw-items-center tw-gap-3">
// 											<Switch
// 												checked={keyword.case_sensitive}
// 												onChange={(e) =>
// 													handleKeywordChange(
// 														index,
// 														"case_sensitive",
// 														e.target.checked,
// 													)
// 												}
// 												color="blue"
// 											/>
// 											<Typography
// 												variant="small"
// 												className="tw-font-medium tw-text-gray-700"
// 											>
// 												Case Sensitive
// 											</Typography>
// 										</div>
// 										<Typography variant="small" className="tw-text-gray-500 tw-text-xs tw-mt-1">
// 											Match exact letter case
// 										</Typography>
// 									</div>
// 								</div>
// 							</div>
// 						))}
// 					</div>
// 				</div>
// 			)}
// 		</div>
// 	);
// }
