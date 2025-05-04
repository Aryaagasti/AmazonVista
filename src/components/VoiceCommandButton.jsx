import { useState, useEffect, useRef } from "react";
import { initSpeechRecognition, parseVoiceCommand, findProductByName } from "../services/speechService";
import productsData from "../assets/products.json";
import { addProductToCartDirectly } from "../context/CartContext";
import { addToCart, updateCartUI } from "../utils/cartHelper";

// Debug flag - set to true to enable console logs
const DEBUG = true;

// Force enable voice commands even in non-secure contexts (for Vercel deployment)
const FORCE_ENABLE_VOICE = true;

export default function VoiceCommandButton({ onAddToCart, onRemoveFromCart }) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [foundProduct, setFoundProduct] = useState(null);
  const [error, setError] = useState(null);
  const [supported, setSupported] = useState(true);
  const [showTutorial, setShowTutorial] = useState(false);

  const recognitionRef = useRef(null);

  // Initialize speech recognition on component mount
  useEffect(() => {
    // Check if we're in a secure context (HTTPS or localhost)
    const isSecureContext = window.isSecureContext;

    // Check if we're in a deployed environment (not localhost)
    const isDeployed = !window.location.hostname.includes('localhost') &&
                       !window.location.hostname.includes('127.0.0.1');

    // Force enable voice commands even in non-secure contexts if flag is set
    if (!isSecureContext && isDeployed && !FORCE_ENABLE_VOICE) {
      if (DEBUG) console.log("Speech recognition requires HTTPS in deployed environments");
      setSupported(false);
      setError("Voice commands require HTTPS. Please use a secure connection.");
      return;
    }

    // Check if speech recognition is supported
    const recognition = initSpeechRecognition();

    if (!recognition) {
      if (DEBUG) console.log("Speech recognition not supported");
      setSupported(false);

      // Provide more specific error message
      if (isDeployed) {
        setError("Voice commands are not supported in this browser. Please try Chrome or Edge.");
      }
    } else {
      if (DEBUG) console.log("Speech recognition is supported");
      setSupported(true);

      // Store initial instance
      recognitionRef.current = recognition;

      // If we're in a deployed environment, log additional information
      if (isDeployed) {
        console.log("Voice commands initialized in deployed environment");
        console.log("Secure context:", isSecureContext);
        console.log("Force enable:", FORCE_ENABLE_VOICE);

        // Try to request microphone permission early
        try {
          navigator.mediaDevices.getUserMedia({ audio: true })
            .then(stream => {
              console.log("Microphone permission granted early");
              // Stop all tracks to release the microphone
              stream.getTracks().forEach(track => track.stop());
            })
            .catch(err => {
              console.error("Error requesting early microphone permission:", err);
            });
        } catch (err) {
          console.error("Error in early microphone permission request:", err);
        }
      }
    }

    // Clean up on unmount
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          console.error("Error cleaning up speech recognition:", e);
        }
      }
    };
  }, []);

  // Toggle listening state
  const toggleListening = () => {
    if (DEBUG) console.log("Toggle listening called, current state:", isListening);

    // Check if we're in a secure context (HTTPS or localhost)
    const isSecureContext = window.isSecureContext;

    // Check if we're in a deployed environment (not localhost)
    const isDeployed = !window.location.hostname.includes('localhost') &&
                       !window.location.hostname.includes('127.0.0.1');

    if (!supported) {
      // If we're forcing voice commands, try to initialize again
      if (isDeployed && !isSecureContext && FORCE_ENABLE_VOICE) {
        if (DEBUG) console.log("Attempting to force enable voice commands");

        try {
          // Try to create a new recognition instance
          const recognition = initSpeechRecognition();

          if (recognition) {
            if (DEBUG) console.log("Successfully forced voice recognition");
            recognitionRef.current = recognition;
            setSupported(true);
            // Continue with listening
          } else {
            setError("Voice commands are not supported in your browser. Please try Chrome or Edge.");
            return;
          }
        } catch (e) {
          console.error("Error forcing voice recognition:", e);
          setError("Could not initialize voice commands. Please try Chrome or Edge.");
          return;
        }
      } else if (isDeployed && !isSecureContext) {
        setError("Voice commands require HTTPS. Please use a secure connection or try on localhost.");
        return;
      } else {
        setError("Speech recognition is not supported in your browser. Please try Chrome or Edge.");
        return;
      }
    }

    // If we're already listening, stop
    if (isListening) {
      if (DEBUG) console.log("Stopping voice recognition");

      try {
        // First update UI state
        setIsListening(false);

        // Then stop recognition
        if (recognitionRef.current) {
          recognitionRef.current.abort();
        }
      } catch (e) {
        console.error("Error stopping recognition:", e);
        // Force reset the state
        setIsListening(false);
      }
      return;
    }

    // If we're not listening, start
    if (DEBUG) console.log("Starting voice recognition");

    // Reset all states first
    setError(null);
    setTranscript("");
    setShowConfirmation(false);
    setPendingAction(null);
    setFoundProduct(null);

    // Create a fresh recognition instance each time
    try {
      // If there's an existing instance, abort it
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          console.error("Error aborting previous recognition:", e);
        }
      }

      // Create a new instance
      const recognition = initSpeechRecognition();

      if (!recognition) {
        setError("Failed to initialize speech recognition. Please try a different browser.");
        return;
      }

      // Set up event handlers
      recognition.onresult = (event) => {
        if (DEBUG) console.log("Recognition result received:", event);

        try {
          const speechResult = event.results[0][0].transcript;
          setTranscript(speechResult);
          console.log("Voice command detected:", speechResult);

          // Parse the command
          const parsedCommand = parseVoiceCommand(speechResult);

          if (parsedCommand.action === 'UNKNOWN') {
            setError(`I didn't understand: "${speechResult}". Try saying "Add [product] to cart" or "Remove [product]".`);
            return;
          }

          // Find the product
          const product = findProductByName(parsedCommand.productName, productsData);

          if (!product) {
            setError(`Sorry, I couldn't find a product matching "${parsedCommand.productName}".`);
            return;
          }

          // Set pending action and show confirmation
          setPendingAction(parsedCommand.action);
          setFoundProduct(product);
          setShowConfirmation(true);
        } catch (e) {
          console.error("Error processing speech result:", e);
          setError("Error processing your command. Please try again.");
        }
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error", event.error);

        // Provide more helpful error messages
        let errorMessage = "An error occurred with voice recognition. Please try again.";

        if (event.error === 'no-speech') {
          errorMessage = "No speech was detected. Please try again and speak clearly.";
        } else if (event.error === 'aborted') {
          errorMessage = "Voice recognition was aborted.";
        } else if (event.error === 'network') {
          errorMessage = "Network error occurred. Please check your internet connection.";
        } else if (event.error === 'not-allowed') {
          errorMessage = "Microphone access was denied. Please allow microphone access to use voice commands.";
        }

        setError(errorMessage);
        setIsListening(false);
      };

      recognition.onend = () => {
        if (DEBUG) console.log("Recognition ended");
        setIsListening(false);
      };

      // Store the new instance
      recognitionRef.current = recognition;

      // Start recognition
      recognition.start();
      setIsListening(true);

      if (DEBUG) console.log("Voice recognition started successfully");

    } catch (e) {
      console.error("Error starting recognition:", e);
      setError("Failed to start voice recognition. Please try again.");
      setIsListening(false);
    }
  };

  // Handle confirmation
  const handleConfirm = () => {
    if (DEBUG) console.log("Confirm button clicked, action:", pendingAction);

    try {
      // Ensure we have a valid product
      if (!foundProduct || typeof foundProduct !== 'object') {
        console.error("Invalid product data in handleConfirm:", foundProduct);
        throw new Error("Invalid product data");
      }

      // Create a sanitized copy of the product with all required fields
      const sanitizedProduct = {
        id: foundProduct.id || Date.now() + Math.floor(Math.random() * 1000),
        title: foundProduct.title || "Product",
        price: foundProduct.price || 999,
        image: foundProduct.image || "https://m.media-amazon.com/images/I/51UW1849rJL._SX679_.jpg",
        rating: foundProduct.rating || 4,
        reviews: foundProduct.reviews || 100,
        category: foundProduct.category || "general",
        brand: foundProduct.brand || "Amazon",
        qty: 1
      };

      if (DEBUG) console.log("Sanitized product:", sanitizedProduct);

      if (pendingAction === 'ADD') {
        if (DEBUG) console.log("Adding product to cart:", sanitizedProduct);

        // Try all three methods to ensure the product is added
        let addedSuccessfully = false;

        // Method 1: Use the cart helper (most reliable)
        try {
          addedSuccessfully = addToCart(sanitizedProduct);
          if (DEBUG) console.log("CartHelper add result:", addedSuccessfully);
        } catch (helperError) {
          console.error("Error in helper add to cart:", helperError);
        }

        // Method 2: Use the direct method
        if (!addedSuccessfully) {
          try {
            addedSuccessfully = addProductToCartDirectly(sanitizedProduct);
            if (DEBUG) console.log("Direct add result:", addedSuccessfully);
          } catch (directError) {
            console.error("Error in direct add to cart:", directError);
          }
        }

        // Method 3: Use the context method as final backup
        setTimeout(() => {
          try {
            if (!addedSuccessfully) {
              onAddToCart(sanitizedProduct);
              console.log("Product added to cart via context method");
              addedSuccessfully = true;
            }
          } catch (contextError) {
            console.error("Error in context add to cart:", contextError);
          }

          // Final fallback: Just add it directly to localStorage
          if (!addedSuccessfully) {
            try {
              console.log("Using localStorage fallback method");
              let currentCart;
              try {
                const savedCart = localStorage.getItem('amazonCart');
                currentCart = savedCart ? JSON.parse(savedCart) : { items: [] };
              } catch (e) {
                currentCart = { items: [] };
              }

              currentCart.items.push(sanitizedProduct);
              localStorage.setItem('amazonCart', JSON.stringify(currentCart));
              addedSuccessfully = true;
              console.log("Product added via localStorage fallback");
            } catch (fallbackError) {
              console.error("Error in localStorage fallback:", fallbackError);
            }
          }

          // Update UI and show message
          updateCartUI();

          // Show success message
          setTimeout(() => {
            if (addedSuccessfully) {
              alert(`Added ${sanitizedProduct.title} to your cart!`);
            } else {
              alert("Failed to add product to cart. Please try again.");
            }
          }, 100);
        }, 50);

      } else if (pendingAction === 'REMOVE') {
        if (DEBUG) console.log("Removing product from cart:", sanitizedProduct.id);

        // Use a timeout to ensure UI updates first
        setTimeout(() => {
          try {
            onRemoveFromCart(sanitizedProduct.id);
            console.log("Product removed from cart successfully");

            // Show success message after a short delay
            setTimeout(() => {
              alert(`Removed ${sanitizedProduct.title} from your cart!`);
            }, 100);
          } catch (innerError) {
            console.error("Error in delayed remove from cart:", innerError);
          }
        }, 50);
      }

      // Reset state immediately to improve UI responsiveness
      setShowConfirmation(false);
      setPendingAction(null);
      setFoundProduct(null);
      setTranscript("");

    } catch (error) {
      console.error("Error in handleConfirm:", error);
      alert("There was an error processing your request. Please try again.");

      // Reset state
      setShowConfirmation(false);
      setPendingAction(null);
      setFoundProduct(null);
      setTranscript("");
    }
  };

  // Handle cancel
  const handleCancel = () => {
    setShowConfirmation(false);
    setPendingAction(null);
    setFoundProduct(null);
    setTranscript("");
  };

  // State for permission prompt
  const [showPermissionPrompt, setShowPermissionPrompt] = useState(false);

  // Request microphone permission
  const requestMicrophonePermission = () => {
    if (DEBUG) console.log("Requesting microphone permission");

    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        // Permission granted
        if (DEBUG) console.log("Microphone permission granted");
        setShowPermissionPrompt(false);

        // Save permission granted flag to localStorage
        try {
          localStorage.setItem('microphonePermissionGranted', 'true');
          console.log("Saved microphone permission to localStorage");
        } catch (e) {
          console.error("Error saving to localStorage:", e);
        }

        // Stop all tracks to release the microphone
        stream.getTracks().forEach(track => track.stop());

        // Start listening
        toggleListening();
      })
      .catch(err => {
        console.error("Error requesting microphone permission:", err);
        setError("Microphone access denied. Please allow microphone access in your browser settings.");
        setShowPermissionPrompt(false);

        // Save permission denied flag to localStorage
        try {
          localStorage.setItem('microphonePermissionDenied', 'true');
        } catch (e) {
          console.error("Error saving to localStorage:", e);
        }
      });
  };

  // Handle initial click - check permission first
  const handleInitialClick = () => {
    if (DEBUG) console.log("Initial click on voice button");

    // Check if we should show the tutorial first
    const tutorialShown = localStorage.getItem('voiceCommandTutorialShown');
    if (!tutorialShown) {
      if (DEBUG) console.log("Showing tutorial");
      setShowTutorial(true);
      localStorage.setItem('voiceCommandTutorialShown', 'true');
      return;
    }

    // Check if permission was previously granted in localStorage
    const permissionGranted = localStorage.getItem('microphonePermissionGranted');
    const permissionDenied = localStorage.getItem('microphonePermissionDenied');

    if (permissionGranted === 'true') {
      if (DEBUG) console.log("Permission previously granted in localStorage");
      // Permission was previously granted, start listening
      toggleListening();
      return;
    }

    if (permissionDenied === 'true') {
      if (DEBUG) console.log("Permission previously denied in localStorage");
      // Show error message but also allow retry
      setError("Microphone access was previously denied. Please allow microphone access in your browser settings.");
      // Still show permission prompt to allow retry
      setShowPermissionPrompt(true);
      return;
    }

    // If we don't have localStorage info, try to check permission status
    try {
      navigator.permissions.query({ name: 'microphone' })
        .then(permissionStatus => {
          if (DEBUG) console.log("Microphone permission status:", permissionStatus.state);

          if (permissionStatus.state === 'granted') {
            // Permission already granted, start listening
            toggleListening();
            // Save to localStorage
            localStorage.setItem('microphonePermissionGranted', 'true');
          } else if (permissionStatus.state === 'prompt') {
            // Show our custom permission prompt
            setShowPermissionPrompt(true);
          } else {
            // Permission denied
            setError("Microphone access denied. Please allow microphone access in your browser settings.");
            // Save to localStorage
            localStorage.setItem('microphonePermissionDenied', 'true');
          }
        })
        .catch(err => {
          console.error("Error checking microphone permission:", err);
          // If we can't check permission, show our custom prompt
          setShowPermissionPrompt(true);
        });
    } catch (err) {
      console.error("Error in permissions API:", err);
      // If permissions API fails, show our custom prompt
      setShowPermissionPrompt(true);
    }
  };

  // Start listening after tutorial
  const startAfterTutorial = () => {
    setShowTutorial(false);

    // Check permission and start listening
    navigator.permissions.query({ name: 'microphone' })
      .then(permissionStatus => {
        if (permissionStatus.state === 'granted') {
          toggleListening();
        } else {
          setShowPermissionPrompt(true);
        }
      })
      .catch(() => {
        // If we can't check permission, just try to start listening
        toggleListening();
      });
  };

  // Check if we're in a deployed environment (not localhost)
  const isDeployed = !window.location.hostname.includes('localhost') &&
                     !window.location.hostname.includes('127.0.0.1');

  // Check if we're in a secure context (HTTPS or localhost)
  const isSecureContext = window.isSecureContext;

  if (!supported) {
    return (
      <div className="relative">
        <button
          className="bg-amazon_teal text-white rounded-full p-2 hover:bg-amazon_teal-dark transition-colors"
          title="Click to enable voice commands"
          onClick={() => {
            // Always show the permission prompt
            setShowPermissionPrompt(true);
          }}
        >
          <span className="material-icons">mic_off</span>
        </button>
        <div className="absolute top-full mt-2 right-0 bg-yellow-50 border border-yellow-200 text-yellow-800 p-2 rounded text-xs w-48">
          Click to enable voice commands
        </div>

        {/* Permission Prompt */}
        {showPermissionPrompt && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[9999]">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl border-4 border-amazon_teal">
              <div className="text-xl font-bold mb-3 flex items-center text-amazon_teal">
                <span className="material-icons text-amazon_teal mr-2">mic</span>
                Enable Voice Commands
              </div>

              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <span className="material-icons text-yellow-400">info</span>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      <strong>Important:</strong> Voice commands require microphone access.
                    </p>
                  </div>
                </div>
              </div>

              <p className="mb-4">
                To use voice commands, we need permission to access your microphone.
                Your voice data is processed locally and not stored.
              </p>

              <div className="bg-gray-100 p-4 rounded-lg mb-4">
                <h3 className="font-bold mb-2">How to enable voice commands:</h3>
                <ol className="list-decimal pl-5 text-sm space-y-2">
                  <li>Click the "Enable Voice Commands" button below</li>
                  <li>When your browser shows a permission popup, click "Allow"</li>
                  <li>If no popup appears, check your browser settings</li>
                </ol>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 px-4 rounded-lg font-medium"
                  onClick={() => setShowPermissionPrompt(false)}
                >
                  Cancel
                </button>
                <button
                  className="flex-1 bg-amazon_teal hover:bg-amazon_teal-dark text-white py-3 px-4 rounded-lg font-bold text-lg flex items-center justify-center"
                  onClick={requestMicrophonePermission}
                >
                  <span className="material-icons mr-2">check_circle</span>
                  Enable Voice Commands
                </button>
              </div>

              <div className="mt-4 text-xs text-gray-500 text-center">
                Note: If you've previously denied permission, you may need to reset it in your browser settings.
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="flex items-center">
        <button
          className={`rounded-full p-2 transition-all duration-300 shadow-md ${
            isListening
              ? "bg-amazon_red text-white animate-pulse scale-110 ring-2 ring-red-300"
              : "bg-amazon_teal text-white hover:bg-amazon_teal-dark hover:scale-105"
          }`}
          onClick={isListening ? toggleListening : handleInitialClick}
          title={isListening ? "Tap to stop listening" : "Tap to use voice commands"}
          style={{ minWidth: '40px', minHeight: '40px' }}
        >
          <span className="material-icons">{isListening ? "mic" : "mic_none"}</span>
        </button>

        {/* Help button */}
        {!isListening && (
          <button
            className="ml-1 text-amazon_teal hover:text-amazon_teal-dark"
            onClick={() => setShowTutorial(true)}
            title="Voice Command Help"
          >
            <span className="material-icons text-sm">help_outline</span>
          </button>
        )}
      </div>

      {/* Tutorial Popup */}
      {showTutorial && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl">
            <div className="text-xl font-bold mb-3 flex items-center text-amazon_teal">
              <span className="material-icons mr-2">record_voice_over</span>
              Voice Shopping Tutorial
            </div>

            <div className="mb-6">
              <p className="mb-3">
                You can now shop using your voice! Here's how it works:
              </p>

              <div className="bg-gray-50 p-3 rounded-lg mb-3">
                <h3 className="font-bold mb-2 flex items-center">
                  <span className="material-icons text-amazon_yellow mr-2">add_shopping_cart</span>
                  Adding Items
                </h3>
                <p className="text-sm mb-1">Try saying:</p>
                <ul className="list-disc pl-5 text-sm">
                  <li className="font-medium text-amazon_teal">"Add product" (adds a top-rated product)</li>
                  <li>"Buy headphones"</li>
                  <li>"iPhone" (just say the product name)</li>
                </ul>
              </div>

              <div className="bg-gray-50 p-3 rounded-lg">
                <h3 className="font-bold mb-2 flex items-center">
                  <span className="material-icons text-amazon_red mr-2">remove_shopping_cart</span>
                  Removing Items
                </h3>
                <p className="text-sm mb-1">Try saying:</p>
                <ul className="list-disc pl-5 text-sm">
                  <li className="font-medium text-amazon_red">"Remove" (removes the last item)</li>
                  <li>"Delete headphones"</li>
                  <li>"Take out watch"</li>
                </ul>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 px-4 rounded-lg font-medium"
                onClick={() => setShowTutorial(false)}
              >
                Maybe Later
              </button>
              <button
                className="flex-1 bg-amazon_teal hover:bg-amazon_teal-dark text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center"
                onClick={startAfterTutorial}
              >
                <span className="material-icons mr-2">mic</span>
                Try Voice Shopping
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Permission Prompt */}
      {showPermissionPrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl border-4 border-amazon_teal">
            <div className="text-xl font-bold mb-3 flex items-center text-amazon_teal">
              <span className="material-icons text-amazon_teal mr-2">mic</span>
              Microphone Access Required
            </div>

            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <span className="material-icons text-yellow-400">info</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    <strong>Important:</strong> Voice commands require microphone access.
                  </p>
                </div>
              </div>
            </div>

            <p className="mb-4">
              To use voice commands, we need permission to access your microphone.
              Your voice data is processed locally and not stored.
            </p>

            <div className="bg-gray-100 p-4 rounded-lg mb-4">
              <h3 className="font-bold mb-2">How to enable microphone access:</h3>
              <ol className="list-decimal pl-5 text-sm space-y-2">
                <li>Click the "Allow Microphone" button below</li>
                <li>When your browser shows a permission popup, click "Allow"</li>
                <li>If no popup appears, check your browser settings</li>
              </ol>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 px-4 rounded-lg font-medium"
                onClick={() => setShowPermissionPrompt(false)}
              >
                Cancel
              </button>
              <button
                className="flex-1 bg-amazon_teal hover:bg-amazon_teal-dark text-white py-3 px-4 rounded-lg font-bold text-lg flex items-center justify-center"
                onClick={requestMicrophonePermission}
              >
                <span className="material-icons mr-2">check_circle</span>
                Allow Microphone
              </button>
            </div>

            <div className="mt-4 text-xs text-gray-500 text-center">
              Note: If you've previously denied permission, you may need to reset it in your browser settings.
            </div>
          </div>
        </div>
      )}

      {/* Listening indicator - Fixed position for better visibility */}
      {isListening && (
        <div className="fixed top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white shadow-xl rounded-lg p-5 z-[9999] w-[90%] max-w-md border-2 border-amazon_red">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <span className="material-icons text-amazon_red text-3xl animate-pulse mr-2">mic</span>
              <span className="text-xl font-bold">Listening...</span>
            </div>
            <button
              className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
              onClick={toggleListening}
              title="Stop listening"
            >
              <span className="material-icons">close</span>
            </button>
          </div>

          <div className="bg-gray-50 p-3 rounded-lg mb-4 border border-gray-200">
            <div className="text-sm text-gray-700 mb-2">
              <span className="font-medium">Try saying:</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white p-2 rounded border border-gray-200 text-sm font-medium text-amazon_teal">
                "Add product"
              </div>
              <div className="bg-white p-2 rounded border border-gray-200 text-sm">
                "Buy headphones"
              </div>
              <div className="bg-white p-2 rounded border border-gray-200 text-sm">
                "Remove"
              </div>
              <div className="bg-white p-2 rounded border border-gray-200 text-sm">
                "iPhone"
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-2 h-5 bg-amazon_red rounded-full animate-bounce"></div>
            <div className="w-2 h-8 bg-amazon_red rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
            <div className="w-2 h-12 bg-amazon_red rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
            <div className="w-2 h-8 bg-amazon_red rounded-full animate-bounce" style={{ animationDelay: "0.6s" }}></div>
            <div className="w-2 h-5 bg-amazon_red rounded-full animate-bounce" style={{ animationDelay: "0.8s" }}></div>
          </div>

          {transcript ? (
            <div className="mt-2 text-lg font-medium text-center p-3 bg-amazon_yellow-light rounded-lg border border-amazon_yellow">
              <div className="text-sm text-gray-600 mb-1">I heard:</div>
              "{transcript}"
            </div>
          ) : (
            <div className="text-center text-gray-500 text-sm italic">
              Waiting for you to speak...
            </div>
          )}

          <button
            className="mt-4 w-full bg-amazon_red hover:bg-red-700 text-white py-3 px-4 rounded-lg text-base font-medium flex items-center justify-center"
            onClick={toggleListening}
          >
            <span className="material-icons mr-2">cancel</span>
            Stop Listening
          </button>
        </div>
      )}

      {/* Error message - Fixed position for better visibility */}
      {error && !isListening && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-white shadow-xl rounded-lg p-4 z-[9999] w-80 border-2 border-red-500">
          <div className="flex items-start mb-2">
            <span className="material-icons text-red-600 mr-2">error</span>
            <div className="text-base text-red-600 font-medium flex-1">{error}</div>
          </div>
          <div className="flex justify-end">
            <button
              className="bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded text-sm font-medium"
              onClick={() => setError(null)}
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Confirmation dialog */}
      {showConfirmation && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[9999]"
          onClick={(e) => {
            // Prevent clicks on the backdrop from closing the dialog
            e.stopPropagation();
          }}
        >
          <div
            className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl border-2 border-amazon_yellow"
            onClick={(e) => {
              // Prevent clicks on the dialog from propagating to the backdrop
              e.stopPropagation();
            }}
          >
            <div className="text-xl font-bold mb-3 flex items-center">
              <span className="material-icons text-amazon_teal mr-2">
                {pendingAction === 'ADD' ? 'add_shopping_cart' : 'remove_shopping_cart'}
              </span>
              Confirm Voice Command
            </div>

            <div className="mb-4 text-lg">
              {pendingAction === 'ADD' ? (
                <p>Add <span className="font-medium text-amazon_teal">{foundProduct.title}</span> to your cart?</p>
              ) : (
                <p>Remove <span className="font-medium text-amazon_red">{foundProduct.title}</span> from your cart?</p>
              )}
            </div>

            <div className="flex items-center p-3 bg-gray-50 rounded-lg mb-5 border border-gray-200">
              <div className="w-20 h-20 flex-shrink-0 mr-4 bg-white p-2 rounded border border-gray-200">
                <img
                  src={foundProduct?.image || "https://m.media-amazon.com/images/I/51UW1849rJL._SX679_.jpg"}
                  alt={foundProduct?.title || "Product"}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    console.log("Image failed to load, using fallback");
                    e.target.onerror = null; // Prevent infinite loop
                    e.target.src = "https://m.media-amazon.com/images/I/51UW1849rJL._SX679_.jpg";
                  }}
                />
              </div>
              <div>
                <div className="text-base font-medium">{foundProduct?.title || "Product"}</div>
                <div className="text-amazon_red font-bold text-lg">₹{foundProduct?.price || 999}</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                className="sm:flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 px-4 rounded-lg font-medium text-base transition-all duration-200 hover:shadow-md active:bg-gray-400"
                onClick={handleCancel}
                type="button"
              >
                Cancel
              </button>

              {/* Confirm button with increased size and prominence */}
              <button
                id="voice-confirm-button"
                className={`sm:flex-1 py-4 px-6 rounded-lg font-bold text-lg transition-all duration-200 shadow-md flex items-center justify-center active:scale-95 ${
                  pendingAction === 'ADD'
                    ? "bg-amazon_yellow hover:bg-amazon_yellow-hover text-black border-2 border-yellow-700"
                    : "bg-amazon_red hover:bg-red-700 text-white border-2 border-red-700"
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();

                  // Visual feedback that button was clicked
                  const button = document.getElementById('voice-confirm-button');
                  if (button) {
                    button.style.transform = 'scale(0.95)';
                    button.style.opacity = '0.9';

                    setTimeout(() => {
                      button.style.transform = '';
                      button.style.opacity = '';
                    }, 150);
                  }

                  // Add a slight delay to ensure visual feedback is seen
                  setTimeout(() => {
                    handleConfirm();
                  }, 50);
                }}
                type="button"
                style={{ minHeight: '60px', cursor: 'pointer' }}
              >
                <span className="material-icons mr-2 text-xl">
                  {pendingAction === 'ADD' ? 'check_circle' : 'delete'}
                </span>
                Confirm
              </button>
            </div>

            {/* Extra help text */}
            <div className="mt-4 text-xs text-gray-500 text-center">
              Click the Confirm button to {pendingAction === 'ADD' ? 'add this item to' : 'remove this item from'} your cart
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
