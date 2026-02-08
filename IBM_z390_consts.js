
const src = `
  # Various IBM z/Arch and ESA/390 constants and locations

  # z/Arch
  .def IBMz__IPL_PSW_addr     0x0000
  .def IBMz__IPL_CCW1_addr    0x0008
  .def IBMz__IPL_CCW2_addr    0x0010

  .def IBMz__External_Interruption_parameter_addr  0x0080
  .def IBMz__External_Interruption_CPU_ADDR_addr   0x0084
  .def IBMz__External_Interruption_Code_addr       0x0086

  .def IBMz__Supervisor_CallyInterruption_Identification_addr  0x0088
  .def IBMz__Program_InterruptionyIdentification_addr          0x008C
  
  .def IBMz__Data_Exception_Code_addr              0x0090
  .def IBMz__Monitor_Class_Number_addr             0x0094
  .def IBMz__PER_Code_addr                         0x0096
  .def IBMz__PER_Address_addr                      0x0098
  .def IBMz__Exception_Access_Identification_addr  0x00A0
  .def IBMz__PER_Access_Identification_addr        0x00A1
  .def IBMz__Operand_AccessyIdentification_addr    0x00A2
  .def IBMz__Store_Status_Architectural_ModeyIdentification_addr  0x00A3
  

`;
export { src }
