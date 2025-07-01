import './App.css';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, Square, Circle, Zap, Settings, Triangle } from 'lucide-react';

const InstantonGrowthLab = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [fieldType, setFieldType] = useState('mexican_hat');
  const [noiseLevel, setNoiseLevel] = useState(0.1);
  const [growthRate, setGrowthRate] = useState(0.02);
  const [selectedShape, setSelectedShape] = useState('gaussian');
  const [placementMode, setPlacementMode] = useState(false);
  
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const fieldRef = useRef(null);
  const timeRef = useRef(0);
  
  const width = 400;
  const height = 300;

  // Initialize the field system
  const initializeField = useCallback(() => {
    fieldRef.current = {
      phi: new Float32Array(width * height),
      phi_prev: new Float32Array(width * height),
      potential: new Float32Array(width * height),
      field_gradient: new Float32Array(width * height),
      instantons: [],
      time: 0
    };
    
    generateFieldPotential();
  }, [fieldType]);

  // Generate different field potentials
  const generateFieldPotential = useCallback(() => {
    if (!fieldRef.current) return;
    
    const field = fieldRef.current;
    
    for (let i = 0; i < width; i++) {
      for (let j = 0; j < height; j++) {
        const idx = i * height + j;
        const x = (i / width - 0.5) * 4;
        const y = (j / height - 0.5) * 4;
        const r = Math.sqrt(x * x + y * y);
        
        switch (fieldType) {
          case 'mexican_hat':
            // V(r) = 0.5*r² - 0.25*r⁴
            field.potential[idx] = 0.5 * r * r - 0.25 * r * r * r * r;
            break;
            
          case 'harmonic':
            // V(r) = 0.5*r²
            field.potential[idx] = 0.5 * r * r;
            break;
            
          case 'double_well':
            // V(x) = (x² - 1)²
            field.potential[idx] = Math.pow(x * x - 1, 2);
            break;
            
          case 'sinusoidal':
            // V(x,y) = sin(2πx) + sin(2πy)
            field.potential[idx] = Math.sin(2 * Math.PI * x) + Math.sin(2 * Math.PI * y);
            break;
            
          case 'ripple':
            // V(r) = sin(3r)/r
            field.potential[idx] = r > 0.1 ? Math.sin(3 * r) / r : 0;
            break;
            
          case 'spiral':
            // V(r,θ) = r*sin(3θ)
            const theta = Math.atan2(y, x);
            field.potential[idx] = r * Math.sin(3 * theta);
            break;
        }
      }
    }
  }, [fieldType]);

  // Place a growth seed (instanton) at a location
  const placeInstanton = useCallback((x, y) => {
    if (!fieldRef.current) return;
    
    const field = fieldRef.current;
    const centerX = Math.floor(x * width);
    const centerY = Math.floor(y * height);
    
    let amplitude = 1.0;
    let radius = 15;
    
    for (let i = 0; i < width; i++) {
      for (let j = 0; j < height; j++) {
        const idx = i * height + j;
        const dx = i - centerX;
        const dy = j - centerY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        let profile = 0;
        
        switch (selectedShape) {
          case 'gaussian':
            profile = amplitude * Math.exp(-dist * dist / (2 * radius * radius));
            break;
            
          case 'sech':
            profile = amplitude / Math.cosh(dist / radius);
            break;
            
          case 'tophat':
            profile = dist < radius ? amplitude : 0;
            break;
            
          case 'ring':
            const ringWidth = 5;
            profile = Math.abs(dist - radius) < ringWidth ? amplitude : 0;
            break;
            
          case 'spiral_seed':
            const angle = Math.atan2(dy, dx);
            profile = amplitude * Math.exp(-dist / radius) * Math.sin(3 * angle + dist * 0.1);
            break;
        }
        
        field.phi[idx] += profile;
      }
    }
    
    // Copy to previous step
    field.phi_prev.set(field.phi);
    
    // Add to instanton tracking
    field.instantons.push({
      x: centerX,
      y: centerY,
      birth_time: field.time,
      shape: selectedShape,
      amplitude: amplitude
    });
  }, [selectedShape]);

  // Evolve the field using wave equation with potential
  const evolveField = useCallback(() => {
    if (!fieldRef.current) return;
    
    const field = fieldRef.current;
    const dt = growthRate;
    const dx = 1.0;
    
    const newPhi = new Float32Array(width * height);
    
    for (let i = 1; i < width - 1; i++) {
      for (let j = 1; j < height - 1; j++) {
        const idx = i * height + j;
        
        // Laplacian (diffusion/wave propagation)
        const laplacian = (
          field.phi[(i+1)*height + j] + field.phi[(i-1)*height + j] +
          field.phi[i*height + (j+1)] + field.phi[i*height + (j-1)] -
          4 * field.phi[idx]
        ) / (dx * dx);
        
        // Force from potential V'(φ)
        const potential_force = -field.potential[idx] * field.phi[idx];
        
        // Nonlinear self-interaction (φ³ term for stability)
        const nonlinear_force = -0.1 * field.phi[idx] * field.phi[idx] * field.phi[idx];
        
        // Add structured noise
        const noise = noiseLevel * (Math.random() - 0.5) * Math.sin(field.time * 0.1 + i * 0.1 + j * 0.1);
        
        // Wave equation: ∂²φ/∂t² = ∇²φ + F(φ,V) + noise
        newPhi[idx] = 2 * field.phi[idx] - field.phi_prev[idx] + 
                      dt * dt * (laplacian + potential_force + nonlinear_force + noise);
      }
    }
    
    // Boundary conditions (absorbing)
    for (let i = 0; i < width; i++) {
      newPhi[i * height] *= 0.9; // Bottom
      newPhi[i * height + height - 1] *= 0.9; // Top
    }
    for (let j = 0; j < height; j++) {
      newPhi[j] *= 0.9; // Left
      newPhi[(width - 1) * height + j] *= 0.9; // Right
    }
    
    // Update field
    field.phi_prev.set(field.phi);
    field.phi.set(newPhi);
    field.time += dt;
    timeRef.current = field.time;
    
    // Calculate field gradient for visualization
    for (let i = 1; i < width - 1; i++) {
      for (let j = 1; j < height - 1; j++) {
        const idx = i * height + j;
        const grad_x = (field.phi[(i+1)*height + j] - field.phi[(i-1)*height + j]) / 2;
        const grad_y = (field.phi[i*height + (j+1)] - field.phi[i*height + (j-1)]) / 2;
        field.field_gradient[idx] = Math.sqrt(grad_x * grad_x + grad_y * grad_y);
      }
    }
  }, [growthRate, noiseLevel]);

  // Render the field
  const renderField = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !fieldRef.current) return;
    
    const ctx = canvas.getContext('2d');
    const field = fieldRef.current;
    
    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, width, height);
    
    // Create field visualization
    const imageData = ctx.createImageData(width, height);
    const data = imageData.data;
    
    // Find min/max for scaling
    let minPhi = Math.min(...field.phi);
    let maxPhi = Math.max(...field.phi);
    let minPot = Math.min(...field.potential);
    let maxPot = Math.max(...field.potential);
    
    for (let i = 0; i < width; i++) {
      for (let j = 0; j < height; j++) {
        const idx = i * height + j;
        const pidx = (j * width + i) * 4;
        
        // Field value (normalized)
        const phi_norm = maxPhi > minPhi ? (field.phi[idx] - minPhi) / (maxPhi - minPhi) : 0;
        
        // Potential value (normalized)
        const pot_norm = maxPot > minPot ? (field.potential[idx] - minPot) / (maxPot - minPot) : 0;
        
        // Field gradient
        const grad_norm = Math.min(field.field_gradient[idx] * 5, 1);
        
        // Color mapping: Red = phi field, Blue = potential, Green = gradient
        data[pidx] = Math.floor(255 * phi_norm);     // Red: field value
        data[pidx + 1] = Math.floor(255 * grad_norm); // Green: field gradient
        data[pidx + 2] = Math.floor(255 * pot_norm);   // Blue: potential
        data[pidx + 3] = 255; // Alpha
      }
    }
    
    ctx.putImageData(imageData, 0, 0);
    
    // Draw instantons
    field.instantons.forEach(instanton => {
      ctx.beginPath();
      ctx.arc(instanton.x, instanton.y, 3, 0, 2 * Math.PI);
      ctx.fillStyle = '#FFFF00';
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1;
      ctx.stroke();
    });
    
  }, []);

  // Animation loop
  useEffect(() => {
    if (!isRunning) return;
    
    const animate = () => {
      evolveField();
      renderField();
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isRunning, evolveField, renderField]);

  // Initialize when component mounts or field type changes
  useEffect(() => {
    initializeField();
    renderField();
  }, [initializeField, renderField]);

  // Handle canvas clicks
  const handleCanvasClick = (event) => {
    if (!placementMode) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    
    placeInstanton(x, y);
    renderField();
  };

  // Reset the field
  const resetField = () => {
    setIsRunning(false);
    timeRef.current = 0;
    if (fieldRef.current) {
      fieldRef.current.phi.fill(0);
      fieldRef.current.phi_prev.fill(0);
      fieldRef.current.instantons = [];
      fieldRef.current.time = 0;
    }
    generateFieldPotential();
    renderField();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center justify-center gap-3">
            <Zap className="text-yellow-400" />
            Instanton Growth Laboratory
            <Settings className="text-cyan-400" />
          </h1>
          <p className="text-gray-300 text-lg">
            Study how growth dynamics behave in different field environments
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls Panel */}
          <div className="bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <h3 className="text-xl font-bold text-white mb-4">Field Environment</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-2">Field Type</label>
                <select
                  value={fieldType}
                  onChange={(e) => setFieldType(e.target.value)}
                  className="w-full bg-gray-800 text-white p-2 rounded"
                >
                  <option value="mexican_hat">Mexican Hat</option>
                  <option value="harmonic">Harmonic</option>
                  <option value="double_well">Double Well</option>
                  <option value="sinusoidal">Sinusoidal</option>
                  <option value="ripple">Ripple</option>
                  <option value="spiral">Spiral</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-300 mb-2">
                  Noise Level: {noiseLevel.toFixed(3)}
                </label>
                <input
                  type="range"
                  min="0"
                  max="0.5"
                  step="0.01"
                  value={noiseLevel}
                  onChange={(e) => setNoiseLevel(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-2">
                  Growth Rate: {growthRate.toFixed(3)}
                </label>
                <input
                  type="range"
                  min="0.005"
                  max="0.1"
                  step="0.005"
                  value={growthRate}
                  onChange={(e) => setGrowthRate(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>

            <h3 className="text-xl font-bold text-white mb-4 mt-6">Growth Seeds</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-2">Seed Shape</label>
                <select
                  value={selectedShape}
                  onChange={(e) => setSelectedShape(e.target.value)}
                  className="w-full bg-gray-800 text-white p-2 rounded"
                >
                  <option value="gaussian">Gaussian</option>
                  <option value="sech">Sech (Soliton)</option>
                  <option value="tophat">Top Hat</option>
                  <option value="ring">Ring</option>
                  <option value="spiral_seed">Spiral Seed</option>
                </select>
              </div>

              <button
                onClick={() => setPlacementMode(!placementMode)}
                className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded font-semibold transition-all ${
                  placementMode 
                  ? 'bg-yellow-500 hover:bg-yellow-600 text-black' 
                  : 'bg-gray-600 hover:bg-gray-700 text-white'
                }`}
              >
                {placementMode ? 'Cancel Placement' : 'Place Seeds (Click Canvas)'}
              </button>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setIsRunning(!isRunning)}
                className={`flex items-center gap-2 px-4 py-2 rounded font-semibold transition-all ${
                  isRunning 
                  ? 'bg-red-500 hover:bg-red-600 text-white' 
                  : 'bg-green-500 hover:bg-green-600 text-white'
                }`}
              >
                {isRunning ? <Pause size={18} /> : <Play size={18} />}
                {isRunning ? 'Pause' : 'Evolve'}
              </button>
              
              <button
                onClick={resetField}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded font-semibold transition-all"
              >
                <RotateCcw size={18} />
                Reset
              </button>
            </div>
          </div>

          {/* Field Visualization */}
          <div className="lg:col-span-2 bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <h3 className="text-xl font-bold text-white mb-4">
              Field Evolution (t = {timeRef.current.toFixed(2)})
            </h3>
            
            <div className="relative">
              <canvas
                ref={canvasRef}
                width={width}
                height={height}
                onClick={handleCanvasClick}
                className={`border border-white/20 rounded-lg ${placementMode ? 'cursor-crosshair' : 'cursor-default'}`}
                style={{ width: '100%', height: 'auto', maxWidth: '600px' }}
              />
              
              {placementMode && (
                <div className="absolute top-2 left-2 bg-yellow-500 text-black px-2 py-1 rounded text-sm font-bold">
                  Click to place {selectedShape} seed
                </div>
              )}
            </div>

            <div className="mt-4 text-sm text-gray-300">
              <div className="grid grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-500 rounded"></div>
                  <span>Field Amplitude</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span>Field Gradient</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-500 rounded"></div>
                  <span>Potential</span>
                </div>
              </div>
              <div className="mt-2">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-yellow-400 rounded-full border border-white"></div>
                  <span>Growth Seeds ({fieldRef.current?.instantons?.length || 0})</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Information Panel */}
        <div className="mt-6 bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-white/10">
          <h3 className="text-xl font-bold text-white mb-4">Experiment Guide</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-300">
            <div>
              <h4 className="text-white font-semibold mb-2">Field Types:</h4>
              <ul className="text-sm space-y-1">
                <li><strong>Mexican Hat:</strong> Creates stable ring patterns</li>
                <li><strong>Harmonic:</strong> Spreads outward from center</li>
                <li><strong>Double Well:</strong> Creates two stable regions</li>
                <li><strong>Sinusoidal:</strong> Creates wave interference patterns</li>
                <li><strong>Ripple:</strong> Oscillating radial patterns</li>
                <li><strong>Spiral:</strong> Creates rotating structures</li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-2">Seed Shapes:</h4>
              <ul className="text-sm space-y-1">
                <li><strong>Gaussian:</strong> Smooth localized bump</li>
                <li><strong>Sech:</strong> Soliton-like shape</li>
                <li><strong>Top Hat:</strong> Sharp-edged circular region</li>
                <li><strong>Ring:</strong> Circular wave pattern</li>
                <li><strong>Spiral Seed:</strong> Creates rotating growth</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstantonGrowthLab;