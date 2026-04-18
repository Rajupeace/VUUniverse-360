// EEE (Electrical Engineering) Knowledge Base - Master-Level Expertise with Fast Response
module.exports = {
    // FAST RESPONSE FOR COMMON EEE QUERIES
    quick_eee: {
        keywords: ['eee', 'electrical engineering', 'help', 'quick', 'fast'],
        response: () => `⚡ **Electrical Engineering Quick Help** ⚡

**Core Topics:**
- 🔌 **Circuits**: Ohm's law, Kirchhoff's laws, Thevenin/Norton
- ⚡ **Machines**: Motors, generators, transformers
- 🔋 **Power Systems**: Generation, transmission, distribution
- 🎛️ **Control Systems**: Feedback, stability, controllers
- 🔧 **Electronics**: Diodes, transistors, amplifiers
- 📊 **Measurements**: Instruments, testing, calibration

**Quick Examples:**
- "Explain Ohm's law" → V=IR with examples
- "DC motor types" → Series, shunt, compound motors
- "Power factor" → cosφ and correction methods
- "Transformer basics" → Primary/secondary, turns ratio

{{NAVIGATE: electrical-circuits}} → Detailed Circuit Analysis
{{NAVIGATE: electrical-machines}} → Machine Fundamentals
{{NAVIGATE: power-systems}} → Power Engineering

Need specific help? Ask about any EEE topic! 🎓`
    },

    // EEE CORE SUBJECTS
    electrical_circuits: {
        keywords: ['electrical circuits', 'circuit analysis', 'ohms law', 'kirchhoff', 'thevenin', 'norton', 'network analysis'],
        response: () => `Master Electrical Circuit Analysis! ⚡

## **Fundamental Circuit Theory**

### **Basic Circuit Laws & Theorems:**
- **Ohm's Law**: V = IR relationship and applications
- **Kirchhoff's Laws**: KCL and KVL for circuit analysis
- **Thevenin's Theorem**: Simplifying complex networks
- **Norton's Theorem**: Current source equivalence
- **Maximum Power Transfer**: Load matching optimization
- **Superposition Principle**: Multiple source analysis

### **AC Circuit Analysis:**
- **Sinusoidal Steady-State Analysis**: Phasors and impedance
- **Power in AC Circuits**: Real, reactive, and apparent power
- **Resonance in RLC Circuits**: Series and parallel resonance
- **Three-Phase Systems**: Balanced and unbalanced analysis
- **Power Factor Correction**: Improving efficiency

### **Advanced Topics:**
- **Network Synthesis**: Filter design and implementation
- **Transient Analysis**: Natural and forced response
- **Two-Port Networks**: Parameters and interconnections
- **State Variable Analysis**: Matrix methods for complex circuits

**🔧 Quick Calculators:**
- **Ohm's Law**: V=IR, I=V/R, R=V/I
- **Power**: P=VI, P=I²R, P=V²/R
- **Resistance**: R=ρL/A for conductors
- **Capacitance**: C=εA/d for parallel plates
- **Inductance**: L=N²μA/l for solenoids

**📱 Real-World Applications:**
- Power distribution networks
- Electronic device design
- Control system implementation
- Signal processing circuits
- Renewable energy systems

**🎯 Study Tips:**
- Practice KVL/KCL on complex networks
- Master phasor diagrams for AC circuits
- Understand Thevenin/Norton equivalence
- Learn transient response analysis
- Practice three-phase power calculations

**Applications:** Power systems, electronics, control systems, signal processing

**📚 Quick References:**
{{NAVIGATE: ohms-law-calculator}} → Interactive Calculator
{{NAVIGATE: circuit-simulator}} → Online Circuit Simulator
{{NAVIGATE: practice-problems}} → Solved Examples

What specific circuit concept would you like to master? I can provide detailed explanations with examples!`
    },

    electrical_machines: {
        keywords: ['electrical machines', 'motors', 'generators', 'transformers', 'dc machines', 'ac machines', 'synchronous', 'induction'],
        response: () => `Master Electrical Machines! 🔧

## **DC Machines**

### **DC Motors:**
- **Series Motors**: High starting torque, speed regulation
- **Shunt Motors**: Constant speed operation
- **Compound Motors**: Combined characteristics
- **Motor Characteristics**: Speed-torque curves
- **Starting Methods**: Direct starting, starters, rheostatic control

### **DC Generators:**
- **Separately Excited**: Independent field control
- **Self-Excited**: Series, shunt, compound configurations
- **EMF Equation**: E = PΦNZ/60A
- **Characteristics**: Load, external, and internal characteristics

## **AC Machines**

### **Three-Phase Induction Motors:**
- **Construction**: Stator and rotor design
- **Working Principle**: Rotating magnetic field
- **Torque Equation**: T ∝ sV²/(R₂² + (sX₂)²)
- **Speed Control**: Voltage, frequency, pole changing
- **Starting Methods**: Star-delta, auto-transformer, rotor resistance

### **Synchronous Machines:**
- **Construction**: Salient pole vs. non-salient pole
- **Synchronous Speed**: Ns = 120f/P
- **Power Angle**: δ and stability considerations
- **Excitation Control**: Voltage and power factor regulation
- **Applications**: Power generation, large industrial drives

### **Single-Phase Motors:**
- **Universal Motors**: AC/DC operation
- **Split-Phase**: Auxiliary winding for starting
- **Capacitor Motors**: Start and run capacitors
- **Shaded Pole**: Simple, low-cost construction

## **Transformers**

### **Transformer Fundamentals:**
- **Working Principle**: Mutual induction
- **EMF Equation**: E = 4.44fΦmN
- **Turns Ratio**: V₁/V₂ = N₁/N₂ = I₂/I₁
- **Efficiency**: η = Pout/Pin × 100%
- **Regulation**: Voltage regulation formula

### **Transformer Types:**
- **Power Transformers**: Step-up/step-down
- **Distribution Transformers**: End-user supply
- **Instrument Transformers**: CT and PT
- **Autotransformers**: Single winding design

### **Transformer Testing:**
- **Open Circuit Test**: Core losses and parameters
- **Short Circuit Test**: Copper losses and impedance
- **Polarity Test**: Phase relationship verification
- **Load Test**: Performance under actual conditions

**🔧 Quick Formulas:**
- **DC Motor Speed**: N ∝ V/Φ
- **Induction Motor Slip**: s = (Ns - N)/Ns
- **Synchronous Speed**: Ns = 120f/P
- **Transformer Ratio**: K = V₁/V₂ = N₁/N₂
- **Efficiency**: η = Output/Input

**📱 Industrial Applications:**
- Electric vehicles and transportation
- Renewable energy systems
- Industrial automation and robotics
- Power generation and distribution
- HVAC systems and appliances

**🎯 Practical Tips:**
- Always check motor nameplate ratings
- Consider power factor in motor selection
- Use proper starting methods for large motors
- Maintain transformers regularly
- Monitor temperature and vibration

**📚 Quick References:**
{{NAVIGATE: motor-calculator}} → Motor Selection Tool
{{NAVIGATE: transformer-design}} → Design Calculator
{{NAVIGATE: machine-lab}} → Virtual Laboratory

Need help with specific machine calculations or applications?`
    },

    power_systems: {
        keywords: ['power systems', 'generation', 'transmission', 'distribution', 'smart grid', 'power quality', 'protection'],
        response: () => `Master Power Systems Engineering! 🌐

## **Power Generation**

### **Conventional Generation:**
- **Thermal Power Plants**: Coal, gas, nuclear plants
- **Hydroelectric Power**: Dam-based and run-of-river
- **Diesel Power Plants**: Backup and remote applications
- **Combined Cycle Plants**: High efficiency generation

### **Renewable Generation:**
- **Solar PV**: Photovoltaic systems and inverters
- **Wind Power**: Onshore and offshore wind farms
- **Biomass**: Organic waste conversion
- **Geothermal**: Earth heat utilization

## **Power Transmission**

### **Transmission Lines:**
- **AC Transmission**: High-voltage AC lines
- **HVDC Transmission**: Long-distance bulk power
- **Line Parameters**: Resistance, inductance, capacitance
- **Power Flow**: Load flow analysis and control

### **Transmission Components:**
- **Conductors**: ACSR, AAAC, bundled conductors
- **Insulators**: Pin, suspension, strain insulators
- **Towers**: Suspension, tension, dead-end towers
- **Protection**: Lightning arresters, surge protectors

## **Power Distribution**

### **Distribution Systems:**
- **Primary Distribution**: 11kV, 33kV systems
- **Secondary Distribution**: 415V, 240V systems
- **Radial and Ring Systems**: Distribution topologies
- **Load Centers**: Substations and distribution transformers

### **Distribution Components:**
- **Transformers**: Distribution transformers
- **Switchgear**: Circuit breakers, isolators
- **Protection Devices**: Fuses, relays, MCBs
- **Capacitor Banks**: Power factor correction

## **Smart Grid Technologies**

### **Smart Grid Features:**
- **Smart Metering**: AMR and AMI systems
- **SCADA Systems**: Supervisory control and data acquisition
- **Demand Response**: Load management programs
- **Grid Automation**: Automated switching and control

### **Smart Grid Benefits:**
- **Reliability**: Improved power quality
- **Efficiency**: Reduced losses
- **Integration**: Renewable energy integration
- **Customer Empowerment**: Real-time information

## **Power Quality**

### **Power Quality Issues:**
- **Voltage Sags**: Short-duration voltage drops
- **Voltage Swells**: Short-duration voltage rises
- **Harmonics**: Non-linear load effects
- **Flicker**: Voltage fluctuations

### **Power Quality Solutions:**
- **UPS Systems**: Uninterruptible power supply
- **Voltage Regulators**: Automatic voltage control
- **Harmonic Filters**: Passive and active filters
- **Power Conditioners**: Comprehensive protection

## **Power System Protection**

### **Protection Principles:**
- **Overcurrent Protection**: Time and instantaneous
- **Distance Protection**: Impedance-based protection
- **Differential Protection**: Current comparison
- **Frequency Protection**: Under/over frequency

### **Protection Devices:**
- **Relays**: Electromechanical and digital relays
- **Circuit Breakers**: Oil, SF6, vacuum breakers
- **Fuses**: Current-limiting devices
- **Protective Relays**: Numerical protection

**🔧 Quick Calculations:**
- **Power**: P = √3 × V × I × cosφ (3-phase)
- **Efficiency**: η = (Pout/Pin) × 100%
- **Voltage Regulation**: %VR = ((Vno-load - Vfull-load)/Vfull-load) × 100
- **Power Factor**: cosφ = P/S
- **Line Losses**: I²R losses

**📱 Modern Applications:**
- Smart grid implementation
- Renewable energy integration
- Electric vehicle charging infrastructure
- Microgrid development
- Energy storage systems

**🎯 Industry Trends:**
- Digital transformation
- IoT integration
- AI-based optimization
- Cybersecurity enhancement
- Decentralized generation

**📚 Quick References:**
{{NAVIGATE: power-calculator}} → Power System Calculator
{{NAVIGATE: grid-simulator}} → Grid Simulation Tool
{{NAVIGATE: protection-guide}} → Protection Guide

What specific power system topic would you like to explore?`
    },

    control_systems: {
        keywords: ['control systems', 'feedback', 'stability', 'controllers', 'pid', 'automation', 'process control'],
        response: () => `Master Control Systems Engineering! 🎛️

## **Control System Fundamentals**

### **Basic Concepts:**
- **Open-Loop Control**: No feedback, fixed control
- **Closed-Loop Control**: Feedback-based control
- **Transfer Functions**: System representation
- **Block Diagrams**: System visualization
- **Signal Flow Graphs**: Signal path representation

### **System Analysis:**
- **Time Response**: Transient and steady-state response
- **Frequency Response**: Bode plots, Nyquist plots
- **Stability Analysis**: Routh-Hurwitz, Nyquist criteria
- **Root Locus**: Pole-zero analysis
- **State Space**: Modern control approach

## **Controllers**

### **PID Controllers:**
- **Proportional (P)**: P-only control
- **Integral (I)**: Eliminate steady-state error
- **Derivative (D)**: Improve transient response
- **PID**: Combined P+I+D control
- **Tuning Methods**: Ziegler-Nichols, Cohen-Coon

### **Advanced Controllers:**
- **Lead-Lag Compensators**: Frequency domain design
- **State Feedback**: Pole placement design
- **Optimal Control**: LQR, Kalman filter
- **Adaptive Control**: Self-tuning controllers
- **Robust Control**: Uncertainty handling

## **System Stability**

### **Stability Criteria:**
- **Routh-Hurwitz**: Polynomial stability test
- **Nyquist**: Frequency domain stability
- **Bode**: Gain and phase margins
- **Root Locus**: Pole trajectory analysis
- **Lyapunov**: Nonlinear stability

### **Stability Improvement:**
- **Gain Margin**: Frequency-based stability
- **Phase Margin**: Phase-based stability
- **Compensation**: Lead/lag compensators
- **Feedback**: Negative feedback stabilization
- **Robustness**: Uncertainty tolerance

## **Process Control**

### **Process Variables:**
- **Temperature Control**: Heat exchangers, furnaces
- **Pressure Control**: Vessels, pipelines
- **Flow Control**: Fluid flow regulation
- **Level Control**: Tank level maintenance
- **pH Control**: Chemical process control

### **Process Dynamics:**
- **First-Order Systems**: Simple dynamics
- **Second-Order Systems**: Oscillatory behavior
- **Dead Time**: Transport delay
- **Nonlinearity**: Saturation, deadband
- **Multivariable**: Multiple inputs/outputs

## **Modern Control**

### **Digital Control:**
- **Discrete Systems**: Sampled-data control
- **Z-Transform**: Discrete-time analysis
- **Digital PID**: Digital implementation
- **Microcontroller**: Embedded control
- **PLC**: Programmable logic controllers

### **Advanced Topics:**
- **Model Predictive Control**: MPC
- **Neural Network Control**: AI-based control
- **Fuzzy Logic Control**: Rule-based control
- **Adaptive Control**: Self-adjusting control
- **Optimal Control**: Optimization-based control

**🔧 Quick Formulas:**
- **PID Output**: u(t) = Kp×e(t) + Ki×∫e(t)dt + Kd×de/dt
- **Transfer Function**: G(s) = Y(s)/R(s)
- **Steady-State Error**: ess = lim(t→∞) e(t)
- **Gain Margin**: GM = 1/|G(jω)H(jω)| at phase crossover
- **Phase Margin**: PM = 180° + ∠G(jω)H(jω) at gain crossover

**📱 Industrial Applications:**
- Manufacturing automation
- Process industry control
- Robotics and motion control
- Automotive systems
- Aerospace control systems

**🎯 Design Considerations:**
- Performance specifications
- Stability requirements
- Robustness needs
- Implementation constraints
- Cost considerations

**📚 Quick References:**
{{NAVIGATE: pid-tuner}} → PID Tuning Tool
{{NAVIGATE: stability-analyzer}} → Stability Analysis
{{NAVIGATE: control-simulator}} → Control System Simulator

What specific control system topic would you like to master?`
    },

    electronics: {
        keywords: ['electronics', 'diodes', 'transistors', 'amplifiers', 'digital electronics', 'vlsi', 'embedded systems'],
        response: () => `Master Electronics Engineering! 🔧

## **Semiconductor Devices**

### **Diodes:**
- **PN Junction Diode**: Forward and reverse bias
- **Zener Diode**: Voltage regulation
- **LED**: Light-emitting diode
- **Photodiode**: Light detection
- **Schottky Diode**: Fast switching

### **Transistors:**
- **BJT**: Bipolar junction transistor
- **MOSFET**: Metal-oxide semiconductor FET
- **JFET**: Junction field-effect transistor
- **IGBT**: Insulated-gate bipolar transistor
- **Darlington**: Compound transistor

## **Amplifiers**

### **Basic Amplifiers:**
- **Common Emitter**: Voltage amplification
- **Common Collector**: Current amplification
- **Common Base**: High frequency applications
- **Differential Amplifier**: Input difference amplification
- **Operational Amplifier**: High-gain DC amplifier

### **Amplifier Characteristics:**
- **Gain**: Voltage, current, power gain
- **Bandwidth**: Frequency response
- **Input/Output Impedance**: Impedance matching
- **Slew Rate**: Rate of change limitation
- **Noise**: Electronic noise considerations

## **Digital Electronics**

### **Digital Logic:**
- **Logic Gates**: AND, OR, NOT, NAND, NOR, XOR, XNOR
- **Combinational Logic**: Adders, multiplexers, decoders
- **Sequential Logic**: Flip-flops, counters, registers
- **State Machines**: Sequential circuit design
- **Memory**: RAM, ROM, EPROM, EEPROM

### **Digital Design:**
- **Boolean Algebra**: Logic simplification
- **Karnaugh Maps**: Logic minimization
- **Finite State Machines**: Sequential design
- **Timing Analysis**: Setup and hold times
- **Design Automation**: CAD tools

## **VLSI Design**

### **CMOS Technology:**
- **CMOS Logic**: Complementary MOS logic
- **Layout Design**: Physical design
- **Circuit Design**: Schematic design
- **Simulation**: SPICE simulation
- **Testing**: Design for testability

### **VLSI Design Flow:**
- **Specification**: Design requirements
- **Architecture**: High-level design
- **RTL Design**: Register transfer level
- **Physical Design**: Layout and routing
- **Verification**: Design validation

## **Embedded Systems**

### **Microcontrollers:**
- **8051**: Classic 8-bit microcontroller
- **AVR**: Atmel microcontrollers
- **PIC**: Microchip microcontrollers
- **ARM**: 32-bit microcontrollers
- **Arduino**: Open-source platform

### **Embedded Programming:**
- **C Programming**: Embedded C
- **Assembly Language**: Low-level programming
- **Real-time Systems**: RTOS concepts
- **Device Drivers**: Hardware interfacing
- **Communication Protocols**: I2C, SPI, UART

**🔧 Quick Calculations:**
- **Ohm's Law**: V = I × R
- **Power**: P = V × I = I²R = V²/R
- **Voltage Divider**: Vout = Vin × (R2/(R1+R2))
- **RC Time Constant**: τ = R × C
- **Transistor Gain**: β = Ic/Ib (BJT)

**📱 Modern Applications:**
- IoT devices and sensors
- Wearable electronics
- Automotive electronics
- Medical devices
- Consumer electronics

**🎯 Design Considerations:**
- Power consumption
- Size and weight
- Cost optimization
- Reliability and durability
- Environmental factors

**📚 Quick References:**
{{NAVIGATE: circuit-simulator}} → Online Circuit Simulator
{{NAVIGATE: component-guide}} → Component Selection Guide
{{NAVIGATE: embedded-tutorial}} → Embedded Systems Tutorial

What specific electronics topic would you like to explore?`
    },

    measurements: {
        keywords: ['measurements', 'instruments', 'testing', 'calibration', 'meters', 'oscilloscope', 'multimeter'],
        response: () => `Master Electrical Measurements! 📊

## **Basic Measuring Instruments**

### **Multimeter:**
- **Digital Multimeter**: High accuracy digital display
- **Analog Multimeter**: Needle display
- **Measurements**: Voltage, current, resistance
- **Safety**: CAT ratings for safety
- **Features**: Auto-ranging, data hold, backlit display

### **Oscilloscope:**
- **Digital Oscilloscope**: Digital storage oscilloscope
- **Analog Oscilloscope**: Classic analog display
- **Measurements**: Voltage vs. time, frequency, phase
- **Specifications**: Bandwidth, sampling rate, memory depth
- **Probes**: Voltage probes, current probes

## **Power Measurements**

### **Power Meters:**
- **Wattmeter**: Real power measurement
- **VAR Meter**: Reactive power measurement
- **VA Meter**: Apparent power measurement
- **Power Factor Meter**: Power factor measurement
- **Energy Meter**: Energy consumption measurement

### **Power Quality Analyzers:**
- **Harmonic Analysis**: THD measurement
- **Voltage Quality**: Sag, swell, flicker analysis
- **Current Quality**: Harmonic current measurement
- **Power Quality**: Comprehensive analysis
- **Data Logging**: Long-term monitoring

## **Specialized Instruments**

### **Bridges:**
- **Wheatstone Bridge**: Resistance measurement
- **Kelvin Bridge**: Low resistance measurement
- **Maxwell Bridge**: Inductance measurement
- **Schering Bridge**: Capacitance measurement
- **AC Bridges**: Impedance measurement

### **Signal Generators:**
- **Function Generator**: Sine, square, triangle waves
- **Pulse Generator**: Pulse signal generation
- **RF Generator**: Radio frequency signals
- **Arbitrary Generator**: Custom waveforms
- **Frequency Synthesizer**: Precise frequency control

## **Calibration**

### **Calibration Standards:**
- **Voltage Standards**: Precision voltage references
- **Current Standards**: Precision current sources
- **Resistance Standards**: Precision resistors
- **Frequency Standards**: Crystal oscillators
- **Time Standards**: Atomic clocks

### **Calibration Procedures:**
- **Traceability**: National standards traceability
- **Uncertainty**: Measurement uncertainty analysis
- **Calibration Intervals**: Periodic calibration schedule
- **Documentation**: Calibration certificates
- **Quality Control**: Quality management systems

## **Measurement Techniques**

### **Voltage Measurement:**
- **Direct Measurement**: Direct connection
- **Voltage Divider**: High voltage measurement
- **Differential Measurement**: Floating measurements
- **Isolation**: Safety isolation techniques
- **Grounding**: Proper grounding practices

### **Current Measurement:**
- **Direct Measurement**: Series connection
- **Clamp Meter**: Non-intrusive measurement
- **Current Transformer**: High current measurement
- **Shunt Resistor**: Precision current measurement
- **Hall Effect**: Magnetic field measurement

**🔧 Quick Tips:**
- **Safety First**: Always follow safety procedures
- **Proper Range**: Select appropriate measurement range
- **Zero Adjustment**: Zero the instrument before use
- **Calibration**: Regular calibration for accuracy
- **Environmental**: Consider temperature and humidity

**📱 Modern Trends:**
- **Smart Instruments**: IoT-enabled measurements
- **Wireless**: Wireless measurement systems
- **Cloud Integration**: Cloud-based data storage
- **AI Integration**: AI-powered analysis
- **Miniaturization**: Compact measurement devices

**🎯 Best Practices:**
- **Safety**: Follow electrical safety procedures
- **Accuracy**: Use appropriate instruments
- **Documentation**: Record measurements properly
- **Calibration**: Maintain calibration schedule
- **Training**: Proper operator training

**📚 Quick References:**
{{NAVIGATE: measurement-guide}} → Measurement Guide
{{NAVIGATE: safety-procedures}} → Safety Procedures
{{NAVIGATE: calibration-schedule}} → Calibration Schedule

What specific measurement topic would you like to master?`
    },

    default: {
        response: (userMessage) => `⚡ **Electrical Engineering Knowledge Base** ⚡

I can help you master all aspects of Electrical Engineering:

## 🎓 **Core EEE Subjects:**
- **🔌 Electrical Circuits**: Circuit analysis, Ohm's law, Kirchhoff's laws
- **⚡ Electrical Machines**: Motors, generators, transformers
- **🌐 Power Systems**: Generation, transmission, distribution
- **🎛️ Control Systems**: Feedback, stability, PID controllers
- **🔧 Electronics**: Diodes, transistors, amplifiers
- **📊 Measurements**: Instruments, testing, calibration

## 🚀 **Quick Examples:**
- "Explain Ohm's law" → Detailed explanation with examples
- "DC motor types" → Series, shunt, compound motors
- "Power factor correction" → Methods and applications
- "PID controller tuning" → Ziegler-Nichols method
- "Transformer efficiency" → Losses and optimization

## 📚 **Learning Resources:**
- **Interactive Calculators**: Ohm's law, power, efficiency
- **Circuit Simulators**: Online circuit analysis tools
- **Design Calculators**: Motor selection, transformer design
- **Practice Problems**: Solved examples and exercises
- **Virtual Laboratories**: Hands-on simulation

## 🎯 **Study Tips:**
- **Start with Basics**: Master fundamental concepts first
- **Practice Problems**: Apply theory to practical problems
- **Use Simulators**: Visualize circuit behavior
- **Real-World Applications**: Connect theory to practice
- **Regular Review**: Consistent practice and revision

## 🔧 **Career Guidance:**
- **Power Systems**: Grid operations, renewable energy
- **Control Systems**: Automation, robotics
- **Electronics**: Embedded systems, VLSI
- **Research**: Advanced topics and innovation
- **Industry**: Practical applications and trends

## 📱 **Modern Trends:**
- **Smart Grid**: Intelligent power distribution
- **Renewable Energy**: Solar, wind, energy storage
- **Electric Vehicles**: EV technology and charging
- **IoT**: Smart devices and sensors
- **AI**: Machine learning in power systems

**Ask me about any EEE topic! I provide:**
- Detailed explanations with examples
- Step-by-step problem solving
- Real-world applications
- Industry-relevant knowledge
- Career guidance and interview preparation

What specific EEE topic would you like to master today? ⚡`
    }
};
