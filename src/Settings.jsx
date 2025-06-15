import { useState, useEffect } from "react";
import { Input } from "blocksin-system";

// Define settings component and pass the canvas as prop
// The reason we  pass canvas  as a prop is that , our  settings component can listen to events happening on the canvas and update  the ui accordingly
// When a  user  selects an object on the canvas the settings panel knows what object is selected and can display the specific control
function Settings({canvas}){
    const [selectedObject, setSelectedObject] = useState(null);
    const [width, setWidth]  = useState("");
    const [height, setHeight] = useState("");
    const [diameter, setDiameter] = useState("");
    const [color, setColor] = useState("");

    //set up event listeners using useEffect hooks, the listeners will allow us to detect when an object is selected modified or scaled and update state accordingly
    // useEffect runs after the component mounts and allows us to add and clean up event listeners
    useEffect(()=>{
        if(canvas){
            canvas.on("selection:created", (event)=>{
                handleObjectSelection(event.selected[0]);
            });

            canvas.on("selection:updated", (event)=>{
                handleObjectSelection(event.selected[0]);
            })
            canvas.on("selection:cleared", (event)=>{
                setSelectedObject(null);
                clearSettings();
            });
            canvas.on("object:modified", (event)=>{
                handleObjectSelection(event.target);
            });
            canvas.on("object:scaling", (event)=>{
                handleObjectSelection(event.target);
            });
            
        }
    }, [canvas]);
    // This function captures the selected objects attributes and update our state so that ui reflects the object's properties

    const handleObjectSelection=(object)=>{
        if(!object) return;

        setSelectedObject(object);
        if(object.type==="rect"){
            setWidth(Math.round(object.width*object.scaleX));
            setHeight(Math.round(object.height*object.scaleY));
            setColor(object.fill);
            setDiameter("");
        }
        else if(object.type==="circle"){
            setDiameter(Math.round(object.radius*2*object.scaleX));
            setColor(object.fill);
            setWidth("");
            setHeight("");
        }

    }    
    const clearSettings=()=>{
        setWidth("");
        setHeight("");
        setColor("");
        setDiameter("");

    };

        const handleWidthChange=(e)=>{
            const value = e.target.value.replace(/,/g, "");
            const intValue = parseInt(value, 10);

            if(isNaN(intValue)){
                setWidth("");
            }
            else{
                setWidth(intValue);
            }

            if(selectedObject && selectedObject.type==="rect" &&  !isNaN(intValue) && intValue>=0){
                selectedObject.set({width:intValue/selectedObject.scaleX});
                canvas.renderAll();
            }
            
        };
        const handleHeightChange=(e)=>{
            const value = e.target.value.replace(/,/g, "");
            const intValue = parseInt(value, 10);
            if(isNaN(intValue)) {
                setHeight("");
            } else {
                setHeight(intValue);
            }

            if(selectedObject && selectedObject.type==="rect" && !isNaN(intValue) && intValue>=0){
                selectedObject.set({height:intValue/selectedObject.scaleY});
                canvas.renderAll();
            }
            
        };
        const handleDiameterChange=(e)=>{
            const value = e.target.value.replace(/,/g, "");
            const intValue = parseInt(value, 10);
                if(isNaN(intValue)) {
                    setDiameter("");
                } else {
                    setDiameter(intValue);
                }

            if(selectedObject && selectedObject.type==="circle" && !isNaN(intValue) && intValue>=0){
                selectedObject.set({radius:intValue/2/selectedObject.scaleX});
                canvas.renderAll();
            }
            
        };
        
        
        const handleColorChange=(e)=>{
            const value = e.target.value;
            setColor(value);

            if(selectedObject){
                selectedObject.set({fill:value});
                canvas.renderAll();

            }
        };

    // ui consists of input fields that allow users to adjust the properties of selected object
    return( 
    <div className="Settings darkmode">
        {selectedObject && selectedObject.type==="rect" &&(
            <>
            <Input
            fluid
            label="Width"
            value={width}
            onChange={handleWidthChange}
            />
            <Input
            label="Height"
            value={height}
            fluid
            onChange={handleHeightChange}
            />
            <Input
            label="Color"
            type="color"
            value={color}
            fluid
            onChange={handleColorChange}
            />
            </>
        )}
        {selectedObject && selectedObject.type==="circle" &&(
            <>
            <Input
            fluid
            label="Diameter"
            value={diameter}
            onChange={handleDiameterChange}
            />
            <Input
            label="Color"
            type="color"
            value={color}
            fluid
            onChange={handleColorChange}
            />
            </>
        )}
    </div>
    );
}
export default Settings;