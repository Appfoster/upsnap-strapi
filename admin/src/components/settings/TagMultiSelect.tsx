// import React, { useState, useRef, useEffect } from "react";
// import { Cross, ChevronDown} from "@strapi/icons";
// import { Tag } from "../../utils/types";
// import { request } from "../../utils/helpers";

// // Type definitions
// interface TagsApiResponse {
//   status: string;
//   message: string;
//   data: Tag[];
// }

// interface TagMultiSelectProps {
//   selectedTagIds: string[];
//   onTagsChange: (tagIds: string[]) => void;
//   placeholder?: string;
//   apiEndpoint?: string;
// }

// // Utility function to generate random colors for new tags
// const generateRandomColor = (): string => {
//   const colors = [
//     "#FF5733", "#33FF57", "#3357FF", "#FF33F5", "#33FFF5",
//     "#FFD700", "#FF6347", "#4169E1", "#32CD32", "#FF1493",
//     "#8A2BE2", "#00CED1", "#FF4500", "#2E8B57", "#DC143C"
//   ];
//   return colors[Math.floor(Math.random() * colors.length)];
// };

// export const TagMultiSelect: React.FC<TagMultiSelectProps> = ({
//   selectedTagIds,
//   onTagsChange,
//   placeholder = "Select or create tags...",
//   apiEndpoint = "/api/tags",
// }) => {
//   const [isOpen, setIsOpen] = useState(false);
//   const [searchInput, setSearchInput] = useState("");
//   const [availableTags, setAvailableTags] = useState<Tag[]>([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [isCreating, setIsCreating] = useState(false);
//   const dropdownRef = useRef<HTMLDivElement>(null);
//   const inputRef = useRef<HTMLInputElement>(null);

//   // Fetch tags on component mount
//   useEffect(() => {
//     fetchTags();
//   }, []);

//   const fetchTags = async () => {
//     setIsLoading(true);
//     try {
//       const response = await request(apiEndpoint, {
//         method: "GET",
//         headers: {
//           "Content-Type": "application/json",
//         },
//       });
//       if (!response) return;

//       if (!response.ok) {
//         throw new Error("Failed to fetch tags");
//       }

//       const result: TagsApiResponse = await response.json();
//       setAvailableTags(result.data);
//     } catch (error) {
//       console.error("Error fetching tags:", error);
//       // You might want to show an error toast here
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const createTag = async (tagName: string): Promise<Tag | null> => {
//     setIsCreating(true);
//     try {
//       const response = await request(apiEndpoint, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           name: tagName,
//           color: generateRandomColor(),
//         }),
//       });
//       if (!response) return null;

//       if (!response.ok) {
//         throw new Error("Failed to create tag");
//       }

//       const result: TagsApiResponse = await response.json();
//       const newTag = result.data[0] || result.data;
      
//       // Add new tag to available tags
//       setAvailableTags((prev) => [...prev, newTag]);
      
//       return newTag;
//     } catch (error) {
//       console.error("Error creating tag:", error);
//       return null;
//     } finally {
//       setIsCreating(false);
//     }
//   };

//     // Get selected tags objects
//     const selectedTags = availableTags.filter((tag) =>
//         selectedTagIds.includes(String(tag.id))
//     );


//   // Filter tags based on search input
//   const filteredTags = availableTags.filter((tag) =>
//     tag.name.toLowerCase().includes(searchInput.toLowerCase())
//   );

//   // Check if search input matches any existing tag
//   const exactMatch = availableTags.find(
//     (tag) => tag.name.toLowerCase() === searchInput.toLowerCase()
//   );

//   // Check if we should show "Create new tag" option
//   const showCreateOption = searchInput.trim() && !exactMatch;

//   // Close dropdown when clicking outside
//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (
//         dropdownRef.current &&
//         !dropdownRef.current.contains(event.target as Node)
//       ) {
//         setIsOpen(false);
//         setSearchInput("");
//       }
//     };

//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   const handleToggleTag = (tagId: number) => {
//     const idStr = String(tagId);
//     if (selectedTagIds.includes(idStr)) {
//       onTagsChange(selectedTagIds.filter((id) => id !== idStr));
//     } else {
//       onTagsChange([...selectedTagIds, idStr]);
//     }
//   };

//   const handleRemoveTag = (tagId: number, e?: React.MouseEvent) => {
//     e?.stopPropagation();
//     const idStr = String(tagId);
//     onTagsChange(selectedTagIds.filter((id) => id !== idStr));
//   };

//   const handleCreateTag = async () => {
//     if (!searchInput.trim() || isCreating) return;

//     const newTag = await createTag(searchInput.trim());
//     if (newTag) {
//       onTagsChange([...selectedTagIds, String(newTag.id)]);
//       setSearchInput("");
//       inputRef.current?.focus();
//     }
//   };

//   const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
//     if (e.key === "Enter") {
//       e.preventDefault();
//       if (showCreateOption) {
//         handleCreateTag();
//       } else if (filteredTags.length === 1) {
//         handleToggleTag(filteredTags[0].id);
//         setSearchInput("");
//       }
//     } else if (e.key === "Backspace" && !searchInput && selectedTags.length > 0) {
//       // Remove last tag on backspace when input is empty
//       handleRemoveTag(selectedTags[selectedTags.length - 1].id);
//     }
//   };

//   return (
//     <div className="tw-relative" ref={dropdownRef}>
//       {/* Main Input Container */}
//       <div
//         className={`tw-flex tw-items-start tw-p-3 tw-border tw-rounded-lg tw-min-h-[48px] tw-cursor-text tw-transition-colors ${
//           isOpen
//             ? "tw-border-blue-500 tw-ring-2 tw-ring-blue-200"
//             : "tw-border-gray-300 hover:tw-border-gray-400"
//         }`}
//         onClick={() => {
//           setIsOpen(true);
//           inputRef.current?.focus();
//         }}
//       >
//         {/* LEFT: Tags + Input (wrapping) */}
//         <div className="tw-flex tw-flex-wrap tw-gap-2 tw-flex-1 tw-items-center">
//           {selectedTags.map((tag) => (
//             <div
//               key={tag.id}
//               className="tw-flex tw-items-center tw-gap-1 tw-px-2 tw-py-1 tw-rounded-md tw-text-sm"
//               style={{
//                 backgroundColor: `${tag.color}20`,
//                 color: tag.color,
//                 border: `1px solid ${tag.color}40`,
//               }}
//             >
//               <span className="tw-font-medium">{tag.name}</span>
//               <button
//                 type="button"
//                 onClick={(e) => handleRemoveTag(tag.id, e)}
//                 className="tw-ml-1 hover:tw-opacity-70"
//               >
//                 <Cross className="tw-w-4 tw-h-4" />
//               </button>
//             </div>
//           ))}

//         <input
//           ref={inputRef}
//           type="text"
//           value={searchInput}
//           onChange={(e) => setSearchInput(e.target.value)}
//           onKeyDown={handleKeyDown}
//           onFocus={() => setIsOpen(true)}
//           placeholder={selectedTags.length === 0 ? placeholder : ""}
//           disabled={isLoading}
//           className={`tw-flex-1 tw-min-w-[120px] tw-outline-none tw-text-sm tw-bg-transparent ${
//             isOpen ? "" : "tw-hidden"
//           }`}
//         />

//         </div>

//         {/* RIGHT: Chevron (fixed position) */}
//         <button
//           type="button"
//           onClick={(e) => {
//             e.stopPropagation();
//             setIsOpen(!isOpen);
//           }}
//           className="tw-ml-2 tw-flex tw-items-center tw-justify-center tw-self-start tw-text-gray-500 hover:tw-text-gray-700"
//         >
//           <ChevronDown
//             className={`tw-w-5 tw-h-5 tw-transition-transform ${
//               isOpen ? "tw-rotate-180" : ""
//             }`}
//           />
//         </button>
//       </div>

//       {/* Dropdown Menu */}
//       {isOpen && (
//         <div className="tw-absolute tw-z-50 tw-w-full tw-mt-2 tw-bg-white tw-border tw-border-gray-300 tw-rounded-lg tw-shadow-lg tw-max-h-[240px] tw-overflow-auto">
//           {isLoading ? (
//             <div className="tw-px-4 tw-py-3 tw-text-sm tw-text-gray-500 tw-text-center">
//               Loading tags...
//             </div>
//           ) : (
//             <>
//               {/* Filtered Tags List */}
//               {filteredTags.length > 0 ? (
//                 <div className="tw-py-1">
//                   {filteredTags.map((tag) => {
//                     const isSelected = selectedTagIds.includes(String(tag.id));
//                     return (
//                       <button
//                         key={tag.id}
//                         type="button"
//                         onClick={() => handleToggleTag(tag.id)}
//                         className={`tw-w-full tw-flex tw-items-center tw-gap-3 tw-px-4 tw-py-2 tw-text-left tw-text-sm tw-transition-colors ${
//                           isSelected
//                             ? "tw-bg-blue-50"
//                             : "hover:tw-bg-gray-50"
//                         }`}
//                       >
//                         {/* Checkbox */}
//                         <div
//                           className={`tw-w-4 tw-h-4 tw-border-2 tw-rounded tw-flex tw-items-center tw-justify-center tw-transition-colors ${
//                             isSelected
//                               ? "tw-bg-blue-500 tw-border-blue-500"
//                               : "tw-border-gray-300"
//                           }`}
//                         >
//                           {isSelected && (
//                             <svg
//                               className="tw-w-3 tw-h-3 tw-text-white"
//                               fill="none"
//                               strokeLinecap="round"
//                               strokeLinejoin="round"
//                               strokeWidth="2"
//                               viewBox="0 0 24 24"
//                               stroke="currentColor"
//                             >
//                               <path d="M5 13l4 4L19 7"></path>
//                             </svg>
//                           )}
//                         </div>

//                         {/* Tag Color Indicator */}
//                         <div
//                           className="tw-w-3 tw-h-3 tw-rounded-full"
//                           style={{ backgroundColor: tag.color }}
//                         />

//                         {/* Tag Name */}
//                         <span className="tw-flex-1">{tag.name}</span>
//                       </button>
//                     );
//                   })}
//                 </div>
//               ) : searchInput && !showCreateOption ? (
//                 <div className="tw-px-4 tw-py-3 tw-text-sm tw-text-gray-500 tw-text-center">
//                   No tags found
//                 </div>
//               ) : null}

//               {/* Create New Tag Option */}
//               {showCreateOption && (
//                 <button
//                   type="button"
//                   onClick={handleCreateTag}
//                   disabled={isCreating}
//                   className="tw-w-full tw-flex tw-items-center tw-gap-3 tw-px-4 tw-py-2 tw-text-left tw-text-sm tw-border-t tw-border-gray-200 hover:tw-bg-gray-50 tw-transition-colors disabled:tw-opacity-50 disabled:tw-cursor-not-allowed"
//                 >
//                   <svg
//                     className="tw-w-4 tw-h-4 tw-text-blue-500"
//                     fill="none"
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth="2"
//                     viewBox="0 0 24 24"
//                     stroke="currentColor"
//                   >
//                     <path d="M12 4v16m8-8H4"></path>
//                   </svg>
//                   <span className="tw-text-blue-600 tw-font-medium">
//                     {isCreating ? "Creating..." : `Create "${searchInput}"`}
//                   </span>
//                 </button>
//               )}
//             </>
//           )}
//         </div>
//       )}
//     </div>
//   );
// };