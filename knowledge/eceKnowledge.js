// ECE (Electronics & Communication Engineering) Knowledge Base - Master-Level Expertise
module.exports = {
    // ECE CORE SUBJECTS
    electronic_devices: {
        keywords: ['electronic devices', 'diodes', 'transistors', 'bjt', 'mosfet', 'jfet', 'operational amplifiers', 'logic gates'],
        response: () => `Master Electronic Devices! 💻

## **Semiconductor Fundamentals**

### **Junctions & Junctions:**
- **P-N Junction**: Formation and characteristics
- **Depletion Region**: Space charge region behavior
- **Forward and Reverse Bias**: Junction operation
- **Breakdown Voltage**: Avalanche and Zener breakdown
- **Temperature Effects**: Thermal behavior of semiconductors
- **Doping**: N-type and P-type semiconductors

### **Diodes:**
- **Junction Diodes**: Rectification and switching
- **Zener Diodes**: Voltage regulation and reference
- **Schottky Diodes**: High-speed switching applications
- **Light Emitting Diodes**: LEDs and optoelectronics
- **Photodiodes**: Light detection and solar cells
- **Varactor Diodes**: Voltage-controlled capacitance

### **Transistors:**
- **BJT (Bipolar Junction)**: Current-controlled devices
- **MOSFET (Metal-Oxide-Semiconductor)**: Voltage-controlled devices
- **JFET (Junction Field Effect)**: High-input impedance
- **IGBT (Insulated Gate Bipolar)**: Power switching devices
- **Darlington Pair**: High current gain
- **Cascode Configuration**: High-frequency operation

## **Amplifier Fundamentals**

### **Operational Amplifiers:**
- **Ideal Op-Amp**: Characteristics and limitations
- **Inverting Amplifier**: Basic inverting configuration
- **Non-Inverting Amplifier**: Non-inverting configuration
- **Differential Amplifier**: Common-mode rejection
- **Instrumentation Amplifier**: Precision amplification
- **Comparator**: Voltage comparison applications
- **Active Filters**: Frequency-selective circuits

### **Amplifier Analysis:**
- **Gain and Bandwidth**: Frequency response analysis
- **Input/Output Impedance**: Impedance matching
- **Slew Rate**: Slew rate limitation
- **Noise Figure**: Noise performance
- **Stability Analysis**: Feedback and oscillation
- **Compensation Techniques**: Frequency compensation

## **Digital Electronics**

### **Logic Gates:**
- **Basic Gates**: AND, OR, NOT, NAND, NOR, XOR, XNOR
- **Universal Gates**: NAND and NOR universality
- **Combinational Logic**: Logic function implementation
- **Sequential Logic**: Flip-flops and latches
- **State Machines**: Counters and shift registers
- **Logic Families**: TTL, CMOS, ECL characteristics

### **Digital Design:**
- **Number Systems**: Binary, octal, hexadecimal, BCD
- **Boolean Algebra**: Logic minimization techniques
- **Karnaugh Maps**: Visual logic simplification
- **Quine-McCluskey**: Tabular minimization
- **Finite State Machines**: Sequential circuit design
- **VHDL/Verilog**: Hardware description languages

## **Communication Systems**

### **Analog Communication:**
- **Modulation Techniques**: AM, FM, PM modulation
- **Demodulation**: Signal recovery techniques
- **Superheterodyne Receivers**: Architecture and design
- **Mixers and Modulators**: Frequency conversion
- **Filters**: RF filters and IF filters
- **Antennas**: Radiation patterns and matching

### **Digital Communication:**
- **Digital Modulation**: ASK, FSK, PSK, QAM
- **Pulse Code Modulation**: PCM and delta modulation
- **Error Detection**: Parity, CRC, checksums
- **Error Correction**: Hamming codes, Reed-Solomon codes
- **Spread Spectrum**: CDMA and frequency hopping
- **OFDM**: Orthogonal frequency division multiplexing

## **Signal Processing**

### **Digital Signal Processing:**
- **Sampling Theory**: Nyquist theorem and aliasing
- **Discrete Fourier Transform**: DFT and FFT algorithms
- **Digital Filters**: FIR and IIR filter design
- **Window Functions**: Spectral leakage reduction
- **Multirate DSP**: Sampling rate conversion
- **Adaptive Filtering**: LMS and RLS algorithms

### **Image Processing:**
- **Image Enhancement**: Contrast, brightness, filtering
- **Image Compression**: JPEG, PNG, GIF compression
- **Edge Detection**: Sobel, Canny, Laplacian operators
- **Image Segmentation**: Thresholding and clustering
- **Feature Extraction**: Pattern recognition
- **Object Recognition**: Template matching and classification

## **VLSI Design**

### **Digital Design:**
- **CMOS Technology**: Complementary MOSFET design
- **Logic Gates**: CMOS gate implementation
- **Sequential Circuits**: Flip-flops and registers
- **Memory Design**: SRAM, DRAM, flash memory
- **ASIC Design**: Application-specific integrated circuits
- **FPGA Design**: Field-programmable gate arrays

### **Analog Design:**
- **Analog Layout**: Physical design considerations
- **Device Matching**: Component matching techniques
- **Noise Analysis**: Thermal and flicker noise
- **Layout Techniques**: Shielding and grounding
- **Testing and Verification**: Design for testability
- **Packaging**: IC packaging and thermal management

## **Advanced Topics**

### **RF/Microwave Engineering:**
- **Transmission Lines**: Characteristic impedance and matching
- **S-Parameters**: Scattering parameters and analysis
- **Smith Chart**: Impedance matching tool
- **Microwave Components**: Resonators and filters
- **Antenna Design**: Radiation patterns and arrays
- **Wireless Communication**: RF propagation and systems

### **Embedded Systems:**
- **Microcontrollers**: PIC, AVR, ARM architecture
- **Real-Time Operating Systems**: RTOS concepts
- **Embedded Linux**: Linux for embedded systems
- **IoT Devices**: Internet of Things platforms
- **Sensor Networks**: Wireless sensor networks
- **Real-Time Constraints**: Timing and scheduling

**Emerging Technologies:** AI hardware accelerators, quantum computing, neuromorphic engineering

What specific ECE topic would you like to master?`
    },

    communication_systems: {
        keywords: ['communication systems', 'analog communication', 'digital communication', 'wireless communication', 'optical communication', 'satellite communication'],
        response: () => `Master Communication Systems Engineering! 📡

## **Analog Communication Systems**

### **Modulation Techniques:**
- **Amplitude Modulation (AM)**: Double-sideband, single-sideband, vestigial sideband
- **Frequency Modulation (FM)**: Wideband FM, narrowband FM, stereo FM
- **Phase Modulation (PM)**: Phase modulation and demodulation
- **Quadrature Modulation**: QAM, QPSK, 16-QAM, 64-QAM
- **Pulse Modulation**: PAM, PWM, PPM, PCM
- **Continuous Phase Modulation**: CPM and GMSK

### **Superheterodyne Receivers:**
- **Architecture**: RF, IF, and baseband stages
- **Mixers**: Frequency conversion and image rejection
- **IF Amplifiers**: Intermediate frequency amplification
- **Detectors**: Demodulation and envelope detection
- **Automatic Gain Control**: AGC for signal strength variation
- **Frequency Synthesis**: PLL-based frequency generation

### **AM/FM Receivers:**
- **Tuned Radio Frequency (TRF)**: Simple receiver architecture
- **Superheterodyne vs TRF**: Performance comparison
- **Crystal Receivers**: Fixed-frequency operation
- **Software Defined Radio**: Flexible digital implementation

## **Digital Communication Systems**

### **Digital Modulation:**
- **Amplitude Shift Keying (ASK)**: On-off keying and variants
- **Frequency Shift Keying (FSK)**: Binary and M-ary FSK
- **Phase Shift Keying (PSK)**: BPSK, QPSK, 8-PSK, 16-PSK
- **Quadrature Amplitude Modulation (QAM)**: 16-QAM, 64-QAM, 256-QAM
- **Offset QAM**: Offset QAM for better performance
- **Differential Modulation**: DQPSK, DQAM

### **Digital Transmission:**
- **Line Coding**: NRZ, RZ, Manchester, AMI coding
- **Block Coding**: Block codes and error detection
- **Convolutional Coding**: Error correction codes
- **Interleaving**: Burst error handling
- **Trellis Coding**: Coded modulation
- **Turbo Coding**: Iterative decoding

## **Wireless Communication**

### **Mobile Communications:**
- **Cellular Networks**: 1G, 2G, 3G, 4G, 5G evolution
- **Multiple Access**: FDMA, TDMA, CDMA, OFDMA
- **Handover Management**: Hard and soft handover
- **Power Control**: Uplink and downlink power control
- **Cell Planning**: Frequency reuse and capacity planning
- **Small Cells**: Femtocells and picocells

### **Wireless Standards:**
- **Wi-Fi (802.11)**: WLAN standards and protocols
- **Bluetooth**: WPAN technology and applications
- **Zigbee**: Low-power mesh networking
- **LTE**: 4G LTE and LTE-Advanced
- **5G NR**: New Radio access technology
- **IoT Protocols**: LoRaWAN, NB-IoT, Sigfox

## **Optical Communication**

### **Fiber Optic Communication:**
- **Optical Fibers**: Step-index and graded-index fibers
- **Light Sources**: LEDs, laser diodes, vertical cavity lasers
- **Photodetectors**: PIN diodes, APDs, photomultipliers
- **Optical Amplifiers**: EDFAs and Raman amplifiers
- **WDM Systems**: Wavelength division multiplexing
- **Optical Networks**: SONET/SDH architectures

### **Optical Modulation:**
- **Intensity Modulation**: Direct and indirect detection
- **Coherent Detection**: Homodyne and heterodyne detection
- **Differential Phase Shift Keying**: DPSK and DQPSK
- **Coherent Optical OFDM**: Coherent optical OFDM systems
- **Advanced Modulation**: 16-QAM, 64-QAM optical systems

## **Satellite Communication**

### **Satellite Orbits:**
- **GEO Satellites**: Geostationary orbit systems
- **LEO Satellites**: Low Earth orbit constellations
- **MEO Satellites**: Medium earth orbit systems
- **Orbital Mechanics**: Kepler's laws and orbital elements
- **Launch Vehicles**: Launch systems and deployment
- **Station Keeping**: Attitude and orbit control

### **Satellite Links:**
- **Link Budget Analysis**: Power calculations and margins
- **Uplink/Downlink**: Forward and return link design
- **Rain Attenuation**: Atmospheric effects mitigation
- **Interference**: Co-channel and adjacent channel interference
- **Multiple Beam Antennas**: Phased array antennas
- **Onboard Processing**: Satellite payload processing

## **Advanced Topics**

### **Software Defined Radio:**
- **SDR Architecture**: Hardware and software components
- **Digital Front-End**: Digital downconversion and upconversion
- **Digital Signal Processing**: Real-time signal processing
- **Cognitive Radio**: Intelligent spectrum management
- **Reconfigurable Architectures**: Adaptive radio systems
- **Open Source SDR**: GNU Radio and USRP platforms

### **Cognitive Radio:**
- **Spectrum Sensing**: Dynamic spectrum awareness
- **Dynamic Spectrum Access**: Opportunistic spectrum use
- **Machine Learning in Communications**: AI-based optimization
- **Adaptive Modulation**: Rate adaptation techniques
- **Cooperative Communication**: Distributed spectrum sharing
- **Policy-Based Radio**: Intelligent decision making

**Emerging Technologies:** 6G research, quantum communication, terahertz communication

What specific communication system would you like to master?`
    },

    microwave_engineering: {
        keywords: ['microwave', 'rf', 'waveguides', 'antennas', 'radar', 'microwave circuits', 'rf design'],
        transmission: () => `Master Microwave Engineering! 📡

## **Microwave Transmission Lines**

### **Transmission Line Theory:**
- **TEM Mode**: Transverse electromagnetic mode
- **TE and TM Modes**: Higher-order modes in waveguides
- **Characteristic Impedance**: Z₀ and line impedance
- **Standing Waves**: Voltage and current standing wave patterns
- **Reflection Coefficient**: Γ and reflection coefficient
- **Transmission Coefficient**: τ and transmission coefficient

### **Waveguide Types:**
- **Rectangular Waveguides**: Standard rectangular waveguide dimensions
- **Circular Waveguides**: Circular waveguide modes
- **Coaxial Lines**: TEM mode transmission lines
- **Microstrip Lines**: Planar transmission lines
- **Coplanar Waveguides**: Coplanar waveguide technology
- **Substrate Integrated Waveguides**: SIW and substrate integrated circuits

### **Waveguide Components:**
- **Waveguide Discontinuities**: Irregularities and junctions
- **Waveguide Bends and Twists**: Mode conversion and loss
- **Waveguide Couplers**: Directional couplers and hybrids
- **Waveguide Terminations**: Matched loads and absorbers
- **Waveguide Transitions**: Mode converters and adapters
- **Waveguide Filters**: E-plane and H-plane filters

## **Microwave Networks**

### **S-Parameters:**
- **Scattering Parameters**: S₁₁, S₁₂, S₂₁, S₂₂
- **Transmission Lines**: ABCD and transmission parameters
- **Conversion**: S-parameters to Z-parameters and Y-parameters
- **Measurement**: Network analyzer measurements
- **Calibration**: SOLT and TRL calibration techniques
- **Uncertainty**: Measurement uncertainty analysis

### **Smith Chart:**
- **Impedance Matching**: Smith chart construction and use
- **Lumped Element Matching**: Stub matching and quarter-wave transformers
- **Transmission Line Matching**: Matching networks and transformers
- **Bandwidth Enhancement**: Multi-section matching
- **Q-Factor**: Quality factor and bandwidth optimization
- **Constant Conductance Circles**: Constant conductance circles

## **Microwave Amplifiers**

### **Small-Signal Amplifiers:**
- **S-Parameter Design**: Amplifier design using S-parameters
- **Gain and Stability**: Gain calculation and stability circles
- **Low-Noise Amplifiers**: Noise figure optimization
- **Broadband Amplifiers**: Multi-octave bandwidth design
- **Distributed Amplifiers**: Distributed amplifier design
- **Power Amplifiers**: High-power amplifier design

### **Power Amplifiers:**
- **Class A Amplifiers**: Linear amplification
- **Class B Amplifiers**: Push-pull operation
- **Class AB Amplifiers**: Efficiency improvement
- **Class C Amplifiers**: High efficiency operation
- **Class D Amplifiers**: Switching amplifiers
- **Class E Amplifiers**: Ultra-linear operation
- **Class F Amplifiers**: High-frequency switching

## **Microwave Antennas**

### **Antenna Types:**
- **Dipole Antennas**: Half-wave and full-wave dipoles
- **Monopole Antennas**: Quarter-wave monopole designs
- **Array Antennas**: Linear and planar arrays
- **Patch Antennas**: Microstrip patch antenna design
- **Horn Antennes**: Horn antenna types and designs
- **Slot Antennes**: Slot antenna configurations
- **Reflector Antennas**: Parabolic and corner reflectors

### **Antenna Arrays:**
- **Linear Arrays**: Uniform and tapered linear arrays
- **Planar Arrays**: Rectangular and circular planar arrays
- **Phased Arrays**: Electronic beam steering
- **Smart Antennas**: Adaptive antenna arrays
- **MIMO Systems**: Multiple-input multiple-output systems
- **Beamforming**: Digital beamforming techniques
- **Antenna Diversity**: Spatial and polarization diversity

## **Microwave Filters**

### **Filter Types:**
- **Low-Pass Filters**: Low-pass filter design
- **High-Pass Filters**: High-pass filter design
- **Band-Pass Filters**: Band-pass filter design
**Band-Stop Filters**: Band-stop filter design
- **Chebyshev Filters**: Equiripple ripple response
- **Elliptic Filters**: Elliptic filter design
- **Butterworth Filters**: Maximally flat passband

### **Filter Implementation:**
- **Distributed Filters**: Transmission line filter sections
- **Lumped Element Filters**: Discrete component filters
- **Microstrip Filters**: Planar filter implementation
- **Waveguide Filters**: Waveguide cavity filters
- **Ceramic Resonators**: Ceramic resonator filters
- **SAW Filters**: Surface acoustic wave filters

## **Radar Systems**

### **Radar Fundamentals:**
- **Radar Equation**: Radar range equation and calculations
- **Radar Cross Section**: Radar cross section and RCS
- **Doppler Effect**: Frequency shift due to target motion
- **Radar Clutter**: Ground clutter and sea clutter
- **Radar Interference**: Interference and jamming
- **Radar Cross Section**: Target radar cross section

### **Radar Types:**
- **Pulsed Radar**: Conventional pulsed radar systems
- **Continuous Wave Radar**: CW radar systems
**FMCW Radar**: Frequency-modulated continuous wave radar
- **MTI Radar**: Moving target indication radar
- **Phased Array Radar**: Electronically steered arrays
- **Synthetic Aperture Radar**: Synthetic aperture radar systems
- **Over-the-Horizon Radar**: Over-the-horizon radar systems

## **Advanced Topics**

### **Millimeter Wave Technology:**
- **Millimeter Wave Frequencies**: 30-300 GHz band
- **Millimeter Wave Components**: Waveguides and components
- **Millimeter Wave Antennas**: High-gain antenna designs
- **Millimeter Wave Propagation**: Atmospheric effects
- **Millimeter Wave Applications**: 5G and beyond
- **Millimeter Wave Imaging**: Millimeter wave imaging systems

### **RF MEMS:**
- **RF MEMS Switches**: Micro-electro-mechanical switches
- **RF MEMS Capacitors**: Variable capacitance devices
- **RF MEMS Inductors**: Variable inductance devices
- **RF MEMS Resonators**: Tunable resonator devices
- **Phase Shifters**: MEMS phase shifters
- **Reconfigurable RF**: Reconfigurable RF components

**Emerging Technologies:** Terahertz technology, quantum radar, cognitive radar, AI-enhanced radar

What specific microwave engineering topic would you like to master?`
    },

    // ECE ADVANCED TOPICS
    vlsi_design: {
        keywords: ['vlsi', 'asic', 'fpga', 'verilog', 'vhdl', 'cmos', 'digital design', 'chip design'],
        response: () => `Master VLSI Design! 💻

## **Digital Design Fundamentals**
- **Number Systems**: Binary, octal, hexadecimal, BCD, Gray code
- **Boolean Algebra**: Logic minimization and simplification
- **Logic Gates**: AND, OR, NOT, NAND, NOR, XOR, XNOR
- **Karnaugh Maps**: Visual logic simplification
- **Quine-McCluskey**: Tabular logic minimization
- **State Machines**: Sequential circuit design
- **Finite State Machines**: Mealy and Moore machines

## **CMOS Technology**

### **CMOS Fundamentals:**
- **MOSFET Structure**: n-channel and p-channel devices
- **CMOS Inverter**: Basic CMOS inverter operation
- **CMOS Logic Gates**: NAND, NOR, AND, OR gates
- **Propagation Delay**: Rise time and fall time
- **Power Consumption**: Static and dynamic power
- **Noise Margins**: Noise immunity and noise margins
- **Layout Design**: Physical layout considerations

### **CMOS Design Rules:**
- **Design Rules**: Lambda-based design rules
- **Scaling**: Device scaling and miniaturization
- **Short Channel Effects**: Short channel effects in MOSFETs
- **Leakage Currents**: Subthreshold leakage currents
- **Hot Carrier Effects**: Temperature-dependent effects
- **Process Variations**: Process variations and yield
- **Design Margins**: Design margins and yield optimization

## **Digital Design**

### **Combinational Logic:**
- **Logic Minimization**: Logic function minimization
- **Logic Optimization**: Area and power optimization
- **Timing Optimization**: Critical path optimization
- **Testability**: Design for testability (DFT)
- **Design Verification**: Formal verification methods
- **Design Reuse**: IP core and design reuse
- **Design Automation**: Automated design tools

### **Sequential Logic:**
- **Flip-Flops**: SR, D, JK, T flip-flops
- **Registers**: Shift registers and data registers
- **Counters**: Synchronous and asynchronous counters
- **State Machines**: Complex state machine design
- **Clock Domain**: Clock domain crossing issues
- **Metastability**: Metastability and timing closure
- **Asynchronous Design**: Asynchronous circuit design

## **VLSI Design Flow**

### **Design Methodology:**
- **Specification**: Requirements specification
- **Architecture**: System architecture design
- **RTL Design**: Register-transfer level design
- **Functional Verification**: Functional simulation
- **Synthesis**: Logic synthesis and optimization
- **Place and Route**: Physical design implementation
- **Timing Closure**: Timing analysis and closure
- **Physical Verification**: Physical verification

### **Design Tools:**
- **HDL Languages**: Verilog, VHDL, SystemVerilog
- **Simulation Tools**: SPICE, ModelSim, VCS
- **Synthesis Tools**: Design Compiler, Precision Synthesis
- **Layout Tools**: Virtuoso, Custom Layout
- **Verification Tools**: Formal verification tools
- **DFT Tools**: Design for testability tools
- **Physical Design**: IC layout and mask design

## **Advanced VLSI**

### **Advanced Topics:**
- **Low Power Design**: Power optimization techniques
- **High-Speed Design**: High-speed circuit design
- **Analog/Mixed-Signal**: Analog and mixed-signal design
- **SoC Design**: System-on-Chip design
- **Network-on-Chip**: NoC integration
- **3D Integration**: Three-dimensional integration
- **Quantum Computing**: Quantum circuit design
- **Neuromorphic Computing**: Neuromorphic circuits

**Applications:** Microprocessors, DSP processors, ASICs, FPGAs, SoCs

What specific VLSI design topic would you like to master?`
    },

    embedded_systems: {
        keywords: ['embedded systems', 'microcontrollers', 'arduino', 'pic', 'arm', 'rtos', 'iot', 'real-time'],
        response: () => `Master Embedded Systems! 🔧

## **Microcontroller Fundamentals**

### **8051 Microcontroller:**
- **Architecture**: Harvard architecture and memory organization
- **Instruction Set**: 8051 instruction set and addressing modes
- **I/O Ports**: Port 0, Port 1, Port 2, Port 3
- **Timers/Counters**: Timer0, Timer1, Timer2 operation
- **Serial Communication**: UART communication protocols
- **Interrupts**: External interrupt handling
- **Power Management**: Power modes and consumption

### **PIC Microcontrollers:**
- **PIC Architecture**: RISC architecture and instruction set
- **Peripheral Devices**: Built-in peripheral modules
- **MPLAB**: Memory organization and banking
- **I/O Expansion**: I/O expansion and multiplexing
- **Communication Protocols**: SPI, I2C, UART protocols
- **Programming**: Assembly and C programming
- **Development Tools**: MPLAB X IDE and compilers

### **ARM Architecture:**
- **ARM Cortex-M**: Cortex-M0, M3, M4, M7 processors
- **Instruction Set**: Thumb-2 and ARM instruction sets
- **Memory Map**: Memory organization and mapping
- **Exception Handling**: Exception and interrupt handling
- **Debugging**: Debug interfaces and breakpoints
- **Power Management**: Sleep modes and power control
- **Development Tools**: Keil MDK and ARM Development Studio

## **Real-Time Operating Systems**

### **RTOS Fundamentals:**
- **Task Management**: Task scheduling and priorities
- **Memory Management**: Dynamic memory allocation
- **Synchronization**: Semaphores, mutexes, message queues
- **Real-Time Constraints**: Deadline constraints and scheduling
- **Priority Inversion**: Priority inversion protocols
- **Resource Management**: Resource allocation and sharing
- **Interrupt Handling**: Interrupt latency and handling

### **RTOS Types:**
- **FreeRTOS**: Open source RTOS for embedded systems
- **ThreadX**: Commercial RTOS for embedded systems
- **µC/OS-II**: Real-time kernel for microcontrollers
- **Zephyr**: RTOS for IoT and embedded devices
- **FreeRTOS**: Real-time operating system
- **Nuttx**: NuttX real-time operating system

## **IoT and Embedded Systems**

### **IoT Platforms:**
- **Arduino**: Arduino Uno, Nano, ESP32 platforms
- **Raspberry Pi**: Single-board computers
- **ESP32**: Wi-Fi and Bluetooth microcontrollers
- **STM32**: STM32 family microcontrollers
- **Nordic Semiconductor**: nRF series devices
- **Texas Instruments**: MSP430 and TMS320 devices
- **Microchip**: PIC and dsPIC devices

### **Wireless Technologies:**
- **Wi-Fi**: 802.11 wireless standards
- **Bluetooth**: Bluetooth Low Energy (BLE)
- **Zigbee**: IEEE 802.15.4 wireless
- **LoRaWAN**: Low-power wide area networks
- **6LoWPAN**: IPv6 over Low-Power Wireless PANs
- **NB-IoT**: Narrowband IoT communications
- **Sigfox**: LPWAN for IoT applications

## **Programming Languages**

### **C Programming:**
- **Embedded C**: C programming for microcontrollers
- **Pointers and Memory**: Pointer arithmetic and memory management
- **Bit Manipulation**: Bit-level operations
- **Structures and Unions**: Data structures and bit fields
- **Interrupt Handlers**: ISRs and interrupt service routines
- **Memory Optimization**: Stack and heap management
- **Code Optimization**: Performance optimization techniques

### **Assembly Language:**
- **Assembly Language**: Assembly language programming
- **Instruction Set**: Instruction set architecture
- **Addressing Modes**: Addressing modes and memory addressing
- **Macros**: Preprocessor directives and macros
- **Linking**: Object file linking and libraries
- **Debugging**: Assembly-level debugging techniques
- **Code Optimization**: Assembly-level optimization

## **Advanced Topics**

### **Real-Time Systems:**
- **Hard Real-Time Systems**: Hard real-time constraints
- **Soft Real-Time Systems**: Soft real-time constraints
- **Firm Real-Time Systems**: Firm real-time constraints
- **Real-Time Scheduling**: EDF, RMS scheduling algorithms
- **Real-Time Communication**: Real-time networking protocols
- **Real-Time Databases**: Real-time database systems
- **Safety-Critical Systems**: Safety-critical system design

### **Security in Embedded:**
- **Secure Boot**: Secure bootloaders and authentication
- **Encryption**: Hardware and software encryption
- **Secure Communication**: Secure communication protocols
- **Firmware Updates**: Over-the-air updates
- **Side-Channel Attacks**: Side-channel attack prevention
- **Hardware Security**: Hardware security modules
- **Trusted Computing**: TPM and secure enclaves

**Applications:** Automotive electronics, industrial automation, consumer electronics, medical devices

What specific embedded systems topic would you like to master?`
    },

    default: {
        response: (userMessage) => `Master Electronics & Communication Engineering with comprehensive knowledge! 💻

I can help you master all ECE subjects with expert-level understanding:

## **🔌 Core ECE Subjects:**
- **Electronic Devices**: Diodes, transistors, MOSFETs, JFETs, op-amps
- **Communication Systems**: Analog/digital communication, wireless, optical, satellite
- **Signal Processing**: DSP, image processing, audio processing, video processing
- **VLSI Design**: Digital design, CMOS, ASIC, FPGA, System-on-Chip
- **Embedded Systems**: Microcontrollers, RTOS, IoT, real-time systems
- **Microwave Engineering**: RF design, antennas, radar, microwave circuits
- **Power Electronics**: Converters, inverters, motor drives, switching power supplies

## **🎯 Advanced Topics:**
- **Wireless Technologies**: 5G, 6G, Wi-Fi, Bluetooth, Zigbee, LoRaWAN
- **Digital Signal Processing**: FFT, filters, adaptive filtering, wavelet transforms
- **Artificial Intelligence**: Machine learning, neural networks, deep learning
- **IoT and Edge Computing**: Sensor networks, edge AI, fog computing
- **Quantum Computing**: Quantum circuits, quantum algorithms
- **Biomedical Electronics**: Medical devices, biosensors, bioinformatics
- **Automotive Electronics**: EV systems, ADAS, infotainment systems

## **💻 Practical Applications:**
- **Circuit Design**: Simulation tools (SPICE, Multisim, ADS)
- **PCB Design**: Altium, KiCad, Eagle PCB design
- **FPGA Programming**: Xilinx Vivado, Intel Quartus, Lattice Diamond
- **Microcontroller Programming**: Arduino, STM32, ESP32, Raspberry Pi
- **Network Protocols**: TCP/IP, UDP, HTTP, MQTT, CoAP
- **Testing & Measurement**: Oscilloscopes, spectrum analyzers, network analyzers

## 📚 Learning Resources:**
- **Step-by-Problem Solving**: Methodical approach to complex problems
- **Simulation Tools**: Practical experience with industry-standard tools
- **Laboratory Experiments**: Hands-on experience with hardware
- **Industry Projects**: Real-world engineering projects
- **Interview Preparation**: Technical interview questions and answers
- **Career Guidance**: Job roles and skill development paths

## 🔧 Technical Skills:**
- **Circuit Analysis**: Network analysis and circuit simulation
- **Device Characterization**: Semiconductor device testing
- **System Integration**: Multi-system integration and interfacing
- **Troubleshooting**: Fault diagnosis and repair techniques
- **Design Optimization**: Performance and cost optimization
- **Standards Compliance**: IEEE, IEC, NEC code requirements
- **Documentation**: Technical writing and report generation

## 🌟 Career Opportunities:**
- **VLSI Design Engineer**: Chip design and verification
- **Embedded Systems Engineer**: Embedded software and hardware design
- **RF Engineer**: Wireless communication systems
- **DSP Engineer**: Digital signal processing systems
- **IoT Engineer**: Internet of Things system design
- **Test Engineer**: Product testing and validation
- **Research Engineer**: R&D and innovation

What specific ECE topic or problem would you like to master? I'll provide comprehensive explanations with practical examples!`
    }
};
