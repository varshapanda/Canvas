// useRef allows fabric js to directly interact with the  dom
import  {useRef, useState, useEffect} from 'react';
import { Canvas, Rect, Circle } from 'fabric';
import "./styles.scss";
import { IconButton } from 'blocksin-system';
import { SquareIcon, CircleIcon} from 'sebikostudio-icons';
import Settings from './Settings';

function App(){
    // useRef is  used to create reference
    // useRef is a hook that returns a mutable object where we can store a reference  of a dom element
    // here we are using to reference our canvas 
    // canvasRef will be connected  to a canvas Element in out jsx allowing us to manipulate canvas directly
    // to do that we will a ref attribute  to our canvas element, what this does is it links this canvas  ref to our actual canvas element in the dom
    // fabric js exactly where to execute its functions
    const canvasRef = useRef(null);
    // usestate is a react hook that lets us keep track of values  that might change  overtime
    const [canvas, setCanvas] = useState(null);

    useEffect(()=>{
        if(canvasRef.current){
            const initCanvas = new Canvas(canvasRef.current, {
                width:500,
                height:500,
            });
            initCanvas.backgroundColor = "#fff";
            initCanvas.renderAll();

            setCanvas(initCanvas);
            return ()=>{
                initCanvas.dispose();
            }
        }
    }, []);
    
    const addRectangle=()=>{
        if(canvas){
            const rect = new Rect({
                top:100,
                left:50,
                width:100,
                height:60,
                fill:"#000000",

            });
            canvas.add(rect);
        }

    }
    const addCircle=()=>{
        if(canvas){
            const circle = new Circle({
                top:150,
                left:150,
                radius:50,
                fill:"#000000",

            });
            canvas.add(circle);
        }

    }
    return (
        <div className='App'>
            {/* Toolbar with buttons that allows to add shapes to the canvas */}
            <div className='Toolbar darkmode'>
                <IconButton onClick={addRectangle} variant="ghost" size="medium">
                    <SquareIcon/>
                </IconButton>
                <IconButton onClick={addCircle} variant="ghost" size="medium">
                    <CircleIcon/>
                </IconButton>
            </div>
        <canvas id ="canvas" ref={canvasRef}/>
        <Settings canvas={canvas}/>
        </div>
    )
}

export default App;