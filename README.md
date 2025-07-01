# It is live at: 

https://anttiluode.github.io/NonLinearFieldPatternLab/

# NonLinearFieldPatternLab

**Interactive exploration of pattern formation in nonlinear wave fields**

🌊 Study how different growth dynamics behave in various field environments  
🎨 Create beautiful mathematical art through wave propagation  
⚡ Real-time interactive pattern generation  

## ✨ What This Does

This lab lets you explore how **wave patterns evolve** in different mathematical field environments. Place growth seeds and watch them propagate according to the **nonlinear wave equation**:

```
∂²φ/∂t² = ∇²φ + F(φ,V) + noise
```

### 🌍 Field Environments
- **Mexican Hat**: Creates stable ring patterns
- **Harmonic**: Spreads outward from center  
- **Double Well**: Two stable regions
- **Sinusoidal**: Wave interference patterns
- **Ripple**: Oscillating radial structures
- **Spiral**: Rotating and twisting dynamics

### 🌱 Growth Seeds
- **Gaussian**: Smooth localized bump
- **Sech**: Soliton-like propagation
- **Top Hat**: Sharp-edged circular waves
- **Ring**: Circular wave patterns
- **Spiral**: Creates rotating growth

## 🎮 How to Use

1. **Choose Field Type**: Select the mathematical environment
2. **Adjust Parameters**: Control noise level and growth rate
3. **Select Seed Shape**: Pick your initial pattern
4. **Click to Place**: Interactive seed placement anywhere
5. **Watch Evolution**: See how patterns develop over time

## 🔬 What You'll Discover

- **Same seed, different fields** → Completely different patterns
- **Multiple seeds** → Complex interference effects  
- **Field-dependent behavior** → Environment shapes growth
- **Noise sensitivity** → Randomness effects on stability
- **Emergent complexity** → Simple rules, beautiful results

## 🎨 Example Patterns

**Spiral Field + Ring Seeds**:
Creates gorgeous flowing spiral cascades

**Mexican Hat + Multiple Seeds**:
Interference between stable ring structures

**Ripple Field + Gaussian Seeds**:
Radiating wave patterns with complex boundaries

## 🛠 Technical Details

Built with:
- **React** for interactive UI
- **Canvas API** for real-time rendering
- **Nonlinear wave equations** for pattern evolution
- **Field theory mathematics** for different environments

### The Math Behind It

Each field type implements a different potential function V(x,y):

- **Mexican Hat**: `V = ½r² - ¼r⁴`
- **Harmonic**: `V = ½r²` 
- **Spiral**: `V = r·sin(3θ)`
- **Sinusoidal**: `V = sin(2πx) + sin(2πy)`

Seeds are placed with different spatial profiles, then evolve according to the wave equation with field-dependent forces.

## 🚀 Getting Started

### Local Development
```bash
npm install
npm start
```

### Build for Production
```bash
npm run build
```

## 🎯 Educational Value

This lab demonstrates:
- **Pattern formation** in nonlinear systems
- **Field-dependent dynamics** in mathematical physics
- **Wave propagation** in structured media
- **Interactive mathematical exploration**
- **Computational aesthetics** from simple equations

Perfect for:
- **Students** learning about wave equations
- **Educators** teaching pattern formation
- **Artists** exploring mathematical beauty
- **Anyone** curious about emergent complexity

## 📊 What's Real vs. Artistic

**Real Mathematics**:
- ✅ Nonlinear wave equation evolution
- ✅ Field-dependent pattern formation  
- ✅ Wave interference and propagation
- ✅ Boundary effects and stability

**Artistic Interpretation**:
- 🎨 "Growth seeds" (just initial conditions)
- 🎨 "Field environments" (mathematical potentials)
- 🎨 Color mapping for visualization
- 🎨 Interactive controls for exploration

## 🌟 Why This Matters

Shows how **simple mathematical rules** can create **incredibly complex and beautiful patterns**. Demonstrates the deep connection between:

- Mathematics and visual beauty
- Simple equations and complex behavior  
- Interactive exploration and understanding
- Field theory and pattern formation

## 📝 License

MIT License - Feel free to explore, modify, and share!

## 🎭 Credits

Created as an exploration of **mathematical pattern formation** through **interactive nonlinear field dynamics**.

**No fake physics claims** - just honest exploration of how beautiful patterns emerge from wave equations in different field environments.

---

*"Mathematics is the art of giving the same name to different things."* - Henri Poincaré

Explore the mathematical universe of pattern formation! 🌌✨
