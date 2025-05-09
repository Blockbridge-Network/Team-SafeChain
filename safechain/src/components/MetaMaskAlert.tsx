export default function MetaMaskAlert() {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white p-6 rounded-lg shadow-xl">
          <h2 className="text-xl font-bold mb-4">MetaMask Not Detected</h2>
          <p className="mb-4">
            Please install MetaMask to use this application.
            You can download it from the official website:
          </p>
          <a
            href="https://metamask.io/download/"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Download MetaMask
          </a>
        </div>
      </div>
    );
  }