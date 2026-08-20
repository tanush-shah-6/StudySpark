import React from 'react';
import './Features.css';
import _Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';

const Carousel = _Carousel.default || _Carousel;

const carouselItems = [
    { id: 1, src: '/images/quiz.png', label: 'Quizzes' },
    { id: 2, src: '/images/flashcards.png', label: 'Flashcards' },
    { id: 3, src: '/images/createroom.png', label: 'Study Rooms' },
];

const responsive = {
    desktop: { breakpoint: { max: 3000, min: 1024 }, items: 1 },
    tablet: { breakpoint: { max: 1024, min: 464 }, items: 1 },
    mobile: { breakpoint: { max: 464, min: 0 }, items: 1 },
};

const FeatureSection = () => {
    return (
        <div className="feature-section">
            <div className="feature-carousel">
                <Carousel responsive={responsive} infinite autoPlay autoPlaySpeed={3000}>
                    {carouselItems.map((item) => (
                        <div key={item.id} className="carousel-item">
                            <img src={item.src} alt={item.label} />
                            <p>{item.label}</p>
                        </div>
                    ))}
                </Carousel>
            </div>
            <div className="feature-details">
                <h2>Boost Your Learning with StudySpark AI</h2>
                <p>Achieve academic excellence with StudySpark, your all-in-one AI learning companion powered by Gemini.</p>
                <ul>
                    <li>
                        <h3>Gemini AI Engine</h3>
                        <p>Leverage the state-of-the-art Gemini Flash model for rapid, intelligent study generation.</p>
                    </li>
                    <li>
                        <h3>Smart Study Tools</h3>
                        <p>Generate interactive Flashcards and Quizzes on any topic instantly to master your subjects.</p>
                    </li>
                    <li>
                        <h3>Collaborative Rooms</h3>
                        <p>Create or join Study Rooms to learn and chat with other students in real-time.</p>
                    </li>
                    <li>
                        <h3>24/7 AI Assistant</h3>
                        <p>Round-the-clock instant AI support for your academic questions and doubts.</p>
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default FeatureSection;
