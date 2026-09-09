import axios from "axios";
import { useEffect, useState } from "react";
import { FaSearch } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { getSearchDropdownMotion, getSearchResultMotion } from "../streamer/searchMotion";

const MotionDropdown = motion.div;
const MotionResult = motion.button;

export default function HomeStreamerSearch() {
    const shouldReduceMotion = useReducedMotion();
    const navigate = useNavigate();
    const [keyword, setKeyword] = useState("");
    const [autoSearch, setAutoSearch] = useState([]);

    useEffect(() => {
        if (!keyword.trim()) {
            setAutoSearch([]);
            return undefined;
        }

        const timer = setTimeout(async () => {
            try {
                const { data } = await axios.get("/streamer/autoSearch", {
                    params: { keyword },
                });
                setAutoSearch(data);
            } catch (error) {
                console.error("Error fetching streamer suggestions:", error);
                setAutoSearch([]);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [keyword]);

    const goToStreamerList = () => {
        const searchKeyword = keyword.trim();

        if (searchKeyword) {
            navigate(`/streamer?keyword=${encodeURIComponent(searchKeyword)}`);
        } else {
            navigate("/streamer");
        }
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        if (keyword.trim()) {
            goToStreamerList();
        }
    };

    const handleSuggestionClick = (streamerNo) => {
        setAutoSearch([]);
        setKeyword("");
        navigate(`/streamer/${streamerNo}`);
    };

    return (
        <div className="home-search-area mt-3">
            <form className="home-search" onSubmit={handleSubmit}>
                <label className="visually-hidden" htmlFor="home-streamer-search">
                    스트리머 검색
                </label>
                <input
                    id="home-streamer-search"
                    type="search"
                    value={keyword}
                    placeholder="스트리머 닉네임을 검색해보세요."
                    onChange={(event) => setKeyword(event.target.value)}
                />
                <button type="submit" aria-label="스트리머 검색">
                    <FaSearch aria-hidden="true" />
                </button>
            </form>
            <AnimatePresence>
            {autoSearch.length > 0 && (
                <MotionDropdown key="suggestions" {...getSearchDropdownMotion(shouldReduceMotion)} className="home-autocomplete" role="listbox">
                    {autoSearch.map((streamer, index) => (
                        <MotionResult
                            {...getSearchResultMotion(index, shouldReduceMotion)}
                            type="button"
                            role="option"
                            aria-selected="false"
                            key={streamer.streamerNo}
                            onClick={() => handleSuggestionClick(streamer.streamerNo)}
                        >
                            {streamer.streamerName}
                        </MotionResult>
                    ))}
                </MotionDropdown>
            )}
            </AnimatePresence>
        </div>
    );
}
