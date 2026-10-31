"use client";

import { createContext, useContext } from "react";

export const PerfContext = createContext({ weak: false });
export const usePerf = () => useContext(PerfContext);
