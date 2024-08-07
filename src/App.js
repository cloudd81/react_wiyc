import React, { useState, useEffect, useRef, createRef, useCallback } from 'react';
import './App.css';
import Modal from './Modal';
import ModalMobile from './ModalMobile';
import ntc from 'ntc';
import Papa from 'papaparse';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import './BoxAnimation.css';
import { CiSearch } from "react-icons/ci";

function App() {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const [inputText, setInputText] = useState('');
    const [colorCode, setColorCode] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [sheetData, setSheetData] = useState([]);
    const [boxPositions, setBoxPositions] = useState([]);

    const nodeRefs = useRef([]);
    const sheetURL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSglsQ4diG-sZN2crtVhvPq7CO7Jap6bbxmE18OupiCFcprfOCzGPFHMcr2fXjkJ9TDOBpIzHE2Tl2V/pub?gid=1797319324&single=true&output=csv';
    const formURL = 'https://docs.google.com/forms/d/e/1FAIpQLScz_nqsN8YVd4VzQ2lqqdnVNsJdZZVc6R1njaUQi21tkKtpuA/formResponse';

    const fetchSheetData = useCallback(async () => {
        try {
            const response = await fetch(sheetURL);
            const reader = response.body.getReader();
            const result = await reader.read();
            const decoder = new TextDecoder('utf-8');
            const csv = decoder.decode(result.value);
            const results = Papa.parse(csv, { header: true });
            setSheetData(results.data);
        } catch (error) {
            console.error('Error fetching sheet data:', error);
        }
    }, [sheetURL]);

    useEffect(() => {
        fetchSheetData();
        const intervalId = setInterval(fetchSheetData, 5000);
        return () => clearInterval(intervalId);
    }, [fetchSheetData]);

    useEffect(() => {
        const calculatePositions = () => {
            const boxSize = 15;
            const containerHeight = window.innerHeight;
            const columns = Math.floor(window.innerWidth / boxSize);
            let positions = [...boxPositions];
            let columnHeights = new Array(columns).fill(0);

            for (let i = 0; i < sheetData.length; i++) {
                if (!positions[i]) {
                    let col = Math.floor(Math.random() * columns);
                    let top = columnHeights[col] * boxSize;

                    if (top + boxSize > containerHeight) {
                        col = (col + 1) % columns;
                        top = columnHeights[col] * boxSize;
                    }

                    positions[i] = {
                        left: col * boxSize,
                        top: containerHeight - top - boxSize,
                        delay: Math.random() * 5
                    };

                    columnHeights[col]++;
                }
            }

            setBoxPositions(positions);
        };

        if (sheetData.length > 0) {
            calculatePositions();
        }

        window.addEventListener('resize', calculatePositions);
        return () => {
            window.removeEventListener('resize', calculatePositions);
        };
    }, [sheetData]); // boxPositions 제거

    const handleChange = (event) => {
        setInputText(event.target.value);
    };

    const handleClick = async () => {
        const color = textToColor(inputText);
        setColorCode(color);
        await fetchSheetData();
        const isDuplicate = sheetData.some(row => {
            return row.syntax === inputText;
        });

        if (inputText && !isDuplicate) {
            submitForm(inputText, color);
        }
        setIsModalOpen(true);
    };

    const submitForm = async (inputText, color) => {
        const formBody = new URLSearchParams();
        formBody.append('entry.1208945866', inputText);
        formBody.append('entry.184357747', color);

        await fetch(formURL, {
            method: 'POST',
            body: formBody,
            mode: 'no-cors',
        });
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleClick();
        }
    };

    const getColorName = (color) => {
        const { name } = ntc.name(color);
        return name || color;
    };

    return (
        <div className="App">
            <div className="Main-Container">
                <div className="Input-Container">
                    <div className="App-Content">
                        <h1>WhatIsYourColor</h1>
                    </div>
                    <input
                        type="text"
                        className="InputField"
                        placeholder="무엇이든색깔로만들어요"
                        value={inputText}
                        onChange={handleChange}
                        onKeyDown={handleKeyDown}
                    />
                    <button onClick={handleClick}><CiSearch/></button>
                </div>
                <TransitionGroup className="Box-Container">
                    {sheetData.slice().reverse().map((data, index) => { // 배열을 역순으로 뒤집기
                        if (!nodeRefs.current[index]) {
                            nodeRefs.current[index] = createRef();
                        }
                        const nodeRef = nodeRefs.current[index];
                        const position = boxPositions[index] || {left: 0, top: 0, delay: 0};
                        return (
                            <CSSTransition
                                in={true}
                                key={index}
                                nodeRef={nodeRef}
                                timeout={500}
                                classNames="box"
                                onExited={() => console.log('Exited')}
                            >
                                <div
                                    ref={nodeRef}
                                    className="box"
                                    style={{
                                        backgroundColor: data.colorCode,
                                        left: `${position.left}px`,
                                        top: `${position.top}px`,
                                        animationDelay: `${position.delay}s`
                                    }}
                                />
                            </CSSTransition>
                        );
                    })}
                </TransitionGroup>
            </div>
            {isModalOpen && (
                isMobile ? (
                    <ModalMobile color={colorCode} onClose={closeModal} getColorName={getColorName}/>
                ) : (
                    <Modal color={colorCode} onClose={closeModal} getColorName={getColorName}/>
                )
            )}
        </div>
    );
}

function MainLogo() {
    return (
        <>
            <img className="LogoImage" alt="logo" src="img/logo512.png" />
        </>
    );
}

function textToColor(text) {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
        hash = text.charCodeAt(i) + ((hash << 5) - hash);
    }
    let color = '#';
    for (let i = 0; i < 3; i++) {
        const value = (hash >> (i * 8)) & 0xFF;
        color += ('00' + value.toString(16)).substr(-2);
    }
    return color;
}

export default App;
