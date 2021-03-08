import React from 'react'
import '../MusicPlayerBar_Components/MusicPlayerBar_styles.css';

function Slider() {
    return (
        <div className='slider-container'>
            <div className='progress-bar-cover'></div>
            <div className='thum'></div>
            <input type='range' step='0.01' className='range' />
        </div>
    )
}

export default Slider;