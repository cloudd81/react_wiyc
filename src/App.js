/* eslint-disable */
import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import Modal from './Modal';
import ModalMobile from './ModalMobile';
import ntc from 'ntc';
import Papa from 'papaparse';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import './BoxAnimation.css'; // 애니메이션 CSS 파일

function App() {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent); // 모바일 확인
    const [inputText, setInputText] = useState('');
    const [colorCode, setColorCode] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [sheetData, setSheetData] = useState([]);
    const [boxPositions, setBoxPositions] = useState([]);

    const sheetURL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSglsQ4diG-sZN2crtVhvPq7CO7Jap6bbxmE18OupiCFcprfOCzGPFHMcr2fXjkJ9TDOBpIzHE2Tl2V/pub?gid=1797319324&single=true&output=csv';
    const formURL = 'https://docs.google.com/forms/d/e/1FAIpQLScz_nqsN8YVd4VzQ2lqqdnVNsJdZZVc6R1njaUQi21tkKtpuA/formResponse';
    const nodeRefs = useRef([]);

    const fetchSheetData = async () => {
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
    };

    useEffect(() => {
        fetchSheetData(); // 초기 데이터 로드
        const intervalId = setInterval(fetchSheetData, 5000); // 5초마다 데이터 로드
        return () => clearInterval(intervalId); // 컴포넌트 언마운트 시 interval 정리
    }, []);

    useEffect(() => {
        const calculatePositions = () => {
            const boxSize = 15; // 박스 크기 (px)
            const containerWidth = window.innerWidth;
            const containerHeight = window.innerHeight;
            const columns = Math.floor(containerWidth / boxSize);

            let positions = [];
            for (let i = 0; i < sheetData.length; i++) {
                const col = i % columns;
                const row = Math.floor(i / columns);
                positions.push({
                    left: col * boxSize,
                    top: containerHeight - (row + 1) * boxSize,
                    delay: Math.random() * 5 // 랜덤 딜레이 (0초에서 5초 사이)
                });
            }

            setBoxPositions(positions);
        };

        calculatePositions();
        window.addEventListener('resize', calculatePositions);

        return () => {
            window.removeEventListener('resize', calculatePositions);
        };
    }, [sheetData]);

    const handleChange = (event) => {
        setInputText(event.target.value);
    };

    const handleClick = async () => {
        const color = textToColor(inputText);
        setColorCode(color);

        await fetchSheetData();

        const isDuplicate = sheetData.some(
            (row) => row.name === inputText
        );

        if (isDuplicate) {
            alert('Duplicate data. Submission aborted.');
            return;
        }

        submitForm(inputText, color);
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

    // 색상 코드에 대응하는 색상 이름 반환
    const getColorName = (color) => {
        const { name } = ntc.name(color);
        return name || color;
    };

    return (
        <div className="App">
            <div className="MainLogo-Container">
                <MainLogo />
                <div className="Input-Container">
                    <input
                        type="text"
                        className="InputField"
                        placeholder="여기에 입력하세요"
                        value={inputText}
                        onChange={handleChange}
                        onKeyDown={handleKeyDown}
                    />
                    <button onClick={handleClick}>🔍</button>
                </div>
            </div>
            <div className="App-Content">
                <h1>WhatIsYourColor</h1>
            </div>
            <TransitionGroup className="box-container">
                {sheetData.map((data, index) => {
                    const nodeRef = nodeRefs.current[index]; // 각 박스에 대한 ref
                    const position = boxPositions[index] || { left: 0, top: 0, delay: 0 };
                    return (
                        <CSSTransition
                            key={index}
                            nodeRef={nodeRef}
                            timeout={500}
                            classNames="box"
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
            {isModalOpen && (
                isMobile ? (
                    <ModalMobile color={colorCode} onClose={closeModal} getColorName={getColorName} />
                ) : (
                    <Modal color={colorCode} onClose={closeModal} getColorName={getColorName} />
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
    )
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
