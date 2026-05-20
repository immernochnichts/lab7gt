import './App.css';
import Mapgl from './Mapgl';
import { MapglContextProvider } from './MapglContext';
import ButtonRulerAddPreset from './ButtonRulerAddPreset';
import ButtonResetMapCenter from './ButtonResetMapCenter';
import ButtonRulerReset from './ButtonRulerReset';
import { ToggleClustererButton, ToggleHeatmapButton } from './ToggleVisibilityButtons';

function App() {
    return (
        <MapglContextProvider>
            <div>
                <div className='App-buttons'>
                    <div className='App-button-item'>
                        <ButtonRulerAddPreset />
                    </div>
                    <div className='App-button-item'>
                        <ButtonRulerReset />
                    </div>
                    <div className='App-button-item'>
                        <ButtonResetMapCenter />
                    </div>
                    <div className='App-button-item'>
                        <ToggleClustererButton />
                    </div>
                    <div className='App-button-item'>
                        <ToggleHeatmapButton />
                    </div>
                </div>

                <div className='App-map-container'>
                    <Mapgl />
                </div>
            </div>
        </MapglContextProvider>
    );
}

export default App;
