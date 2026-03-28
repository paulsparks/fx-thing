import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ReactFlowProvider } from "@xyflow/react";
import { ToastContainer } from "react-toastify";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<>
			<ToastContainer />
			<ReactFlowProvider>
				<html
					lang="en"
					className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
				>
					<body className="min-h-full flex flex-col">{children}</body>
				</html>
			</ReactFlowProvider>
		</>
	);
}
