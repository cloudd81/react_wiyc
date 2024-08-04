// Modal.js
import React, { useState, useRef, useEffect } from 'react';
import html2canvas from 'html2canvas';
import './Modal.css';

const Modal = ({ color, onClose, getColorName }) => {
    const [cardStyle, setCardStyle] = useState({'backgroundColor': color, transForm: ''});
    const modalRef = useRef(null);
    const colorCardRef = useRef(null);

    const handleSaveImage = async () => {
        const canvas = await html2canvas(colorCardRef.current);
        const imgData = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = imgData;
        link.download = 'color_image.png';
        link.click();
    };

    const rotateCardStyle = (rotateX, rotateY) => {
        // 기존 상태를 복사하여 새 객체를 생성
        setCardStyle(prevStyle => ({
            ...prevStyle,
            transform: `perspective(400px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)` // 원하는 새로운 스타일을 적용
        }));
    };

    const onMouseMove = (e) => {
        const rect = colorCardRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const rotateY = -1/5 * x + 20;
        const rotateX = 4/30 * y - 20;

        rotateCardStyle(rotateX, rotateY);
    }

    const onMouseLeave = (e) => {
        setCardStyle({
            ...cardStyle,
            transform: 'rotateX(0deg) rotateY(0deg)',
        });
    }

    useEffect(() => {
        const colorCardElement = colorCardRef.current;

        if(colorCardElement) {
            colorCardElement.addEventListener('mousemove', onMouseMove);
            colorCardElement.addEventListener('mouseleave', onMouseLeave);

            return () => {
                colorCardElement.removeEventListener('mousemove', onMouseMove);
                colorCardElement.removeEventListener('mouseleave', onMouseLeave);
            }
        }
    }, []);

    return (
        <div className="ModalOverlay">
            <div className="ModalContent" ref={modalRef}>
                <div className="ModalBody">
                    <div className="ColorCard" ref={colorCardRef} style={cardStyle}></div>
                </div>
                <div className="ModalFooter">
                    <button className="CloseButton" onClick={onClose}>✖</button>
                    <h1>색상코드 : {getColorName(color)}</h1>
                    <button className="SaveButton" onClick={handleSaveImage}>이미지 저장</button>
                </div>
            </div>
        </div>
    );
};

export default Modal;
