/* eslint-disable */
import React, {useState, useEffect} from 'react';
import './App.css';
import Modal from './Modal';
import ModalMobile from './ModalMobile';
import ntc from 'ntc';

function App() {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const [backgroundColor, setBackgroundColor] = useState('#ffffff');
    const [textColor, setTextColor] = useState('#000000');
    const [inputText, setInputText] = useState('');
    const [colorCode, setColorCode] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const randomColor = generateRandomColor();
        setBackgroundColor(randomColor);
        setTextColor(getContrastingColor(randomColor));
    }, []);

    const handleChange = (event) => {
        setInputText(event.target.value);
    };

    const handleClick = () => {
        const color = textToColor(inputText);
        setColorCode(color);
        setIsModalOpen(true);
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
        <div className="App" style={{backgroundColor: backgroundColor, color: textColor}}>
            <div className="MainLogo-Container">
                <MainLogo/>
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
            {isModalOpen &&(
                isMobile? (
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
            <img className="LogoImage" alt="logo" src="img/logo512.png"/>
        </>
    )
}

function generateRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function getContrastingColor(color) {
    const r = parseInt(color.substring(1, 2), 16);
    const g = parseInt(color.substring(3, 2), 16);
    const b = parseInt(color.substring(5, 2), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? '#000000' : '#ffffff';
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
