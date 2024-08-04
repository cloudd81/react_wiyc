// Modal.js
import React, { useRef } from 'react';
import html2canvas from 'html2canvas';
import './ModalMobile.css';

const ModalMobile = ({ color, onClose, getColorName }) => {
    const cardRef = useRef(null);

    const handleSaveImage = async () => {
        try {
            const canvas = await html2canvas(cardRef.current);
            canvas.toBlob(async (blob) => {
                if (navigator.share) {
                    const file = new File([blob], 'color_image.png', { type: 'image/png' });
                    try {
                        await navigator.share({
                            files: [file],
                            title: 'Color Image',
                        });
                    } catch (error) {
                        console.error('Error sharing image:', error);
                    }
                } else {
                    alert('공유 기능을 지원하지 않습니다.');
                }
            }, 'image/png');
        } catch (error) {
            console.error('Error saving image:', error);
        }
    };

    return (
        <div className="ModalOverlay">
            <div className="ModalContent">
                <div className="ModalBody" ref={cardRef} style={{background : color}}>
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

export default ModalMobile;
