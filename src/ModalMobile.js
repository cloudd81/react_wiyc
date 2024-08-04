// Modal.js
import React, { useRef } from 'react';
import html2canvas from 'html2canvas';
import './ModalMobile.css';

const ModalMobile = ({ color, onClose, getColorName }) => {
    const cardRef = useRef(null);

    const handleSaveImage = async () => {
        try {
            const canvas = await html2canvas(cardRef.current);
            canvas.toBlob((blob) => {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'color_image.png';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
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
