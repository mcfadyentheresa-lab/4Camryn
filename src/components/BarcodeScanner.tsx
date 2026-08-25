import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeScannerState } from 'html5-qrcode';

export interface NutritionData {
  productName: string;
  brandName: string;
  servingSize: string;
  calories: number | null;
  protein_g: number | null;
  carbs_g: number | null;
  fat_g: number | null;
  fiber_g: number | null;
  sugar_g: number | null;
  barcode: string;
}

interface BarcodeScannerProps {
  onResult: (data: NutritionData) => void;
  onClose: () => void;
}

type ScanState = 'scanning' | 'loading' | 'found' | 'not_found' | 'error';

async function lookupBarcode(barcode: string): Promise<NutritionData | null> {
  try {
    const res = await fetch(
      `https://world.openfoodfacts.org/api/v2/product/${barcode}?fields=product_name,brands,serving_size,nutriments`,
      { headers: { 'User-Agent': 'CamrynApp/1.0' } }
    );
    if (!res.ok) return null;
    const json = await res.json();
    if (json.status !== 1 || !json.product) return null;

    const p = json.product;
    const n = p.nutriments ?? {};

    const round1 = (v: any) => (v != null ? Math.round(Number(v) * 10) / 10 : null);

    return {
      productName: p.product_name || 'Unknown product',
      brandName: p.brands || '',
      servingSize: p.serving_size || '100g',
      calories: round1(n['energy-kcal_serving'] ?? n['energy-kcal_100g']),
      protein_g: round1(n['proteins_serving'] ?? n['proteins_100g']),
      carbs_g: round1(n['carbohydrates_serving'] ?? n['carbohydrates_100g']),
      fat_g: round1(n['fat_serving'] ?? n['fat_100g']),
      fiber_g: round1(n['fiber_serving'] ?? n['fiber_100g']),
      sugar_g: round1(n['sugars_serving'] ?? n['sugars_100g']),
      barcode,
    };
  } catch {
    return null;
  }
}

// stop() throws synchronously ("Cannot stop, scanner is not running or
// paused") when the scanner isn't actively scanning, before it ever
// returns a promise -- so a plain `.stop().catch(...)` doesn't protect
// against it; the throw happens before .catch is even reached. Checking
// getState() first mirrors the library's own internal precondition.
function stopIfRunning(scanner: Html5Qrcode): Promise<void> {
  if (scanner.getState() === Html5QrcodeScannerState.NOT_STARTED) {
    return Promise.resolve();
  }
  return scanner.stop().catch(() => {});
}

export default function BarcodeScanner({ onResult, onClose }: BarcodeScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [state, setState] = useState<ScanState>('scanning');
  const [result, setResult] = useState<NutritionData | null>(null);
  const [manualBarcode, setManualBarcode] = useState('');
  const [cameraError, setCameraError] = useState(false);
  const scannedRef = useRef(false);
  // Guards against two related races: calling stop() on a scanner whose
  // start() is still pending (React 18 StrictMode's mount->cleanup->mount
  // reliably triggers this in dev; a user closing the modal before the
  // camera permission prompt resolves can trigger it in production too),
  // and start() succeeding *after* the component has already unmounted,
  // which would otherwise leave the camera stream running indefinitely.
  const mountedRef = useRef(true);

  const startScanning = () => {
    const scannerId = 'barcode-scanner-region';
    const scanner = new Html5Qrcode(scannerId);
    scannerRef.current = scanner;

    scanner
      .start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 260, height: 160 } },
        async (decodedText) => {
          if (scannedRef.current) return;
          scannedRef.current = true;
          await stopIfRunning(scanner);
          if (!mountedRef.current) return;
          setState('loading');
          const data = await lookupBarcode(decodedText);
          if (!mountedRef.current) return;
          if (data) {
            setResult(data);
            setState('found');
          } else {
            setState('not_found');
          }
        },
        () => {}
      )
      .then(() => {
        if (!mountedRef.current) stopIfRunning(scanner);
      })
      .catch(() => {
        if (mountedRef.current) setCameraError(true);
      });
  };

  useEffect(() => {
    mountedRef.current = true;
    startScanning();
    return () => {
      mountedRef.current = false;
      if (scannerRef.current) stopIfRunning(scannerRef.current);
    };
  }, []);

  const handleManualLookup = async () => {
    const code = manualBarcode.trim();
    if (!code) return;
    setState('loading');
    const data = await lookupBarcode(code);
    if (data) {
      setResult(data);
      setState('found');
    } else {
      setState('not_found');
    }
  };

  const handleRetry = () => {
    scannedRef.current = false;
    setResult(null);
    setManualBarcode('');
    setCameraError(false);
    setState('scanning');
    startScanning();
  };

  return (
    <div className="scanner-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="scanner-modal">
        <div className="scanner-header">
          <h3 className="scanner-title">Scan barcode</h3>
          <button className="scanner-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        {state === 'scanning' && (
          <>
            {!cameraError ? (
              <div className="scanner-viewport">
                <div id="barcode-scanner-region" className="scanner-region" />
                <div className="scanner-crosshair">
                  <div className="scanner-frame" />
                </div>
                <p className="scanner-hint">Point at a barcode on any food packaging</p>
              </div>
            ) : (
              <div className="scanner-no-camera">
                <p>Camera not available. Enter the barcode number manually.</p>
              </div>
            )}

            <div className="scanner-manual">
              <p className="scanner-manual-label">Or enter barcode manually</p>
              <div className="scanner-manual-row">
                <input
                  type="text"
                  inputMode="numeric"
                  className="body-input"
                  style={{ flex: 1 }}
                  value={manualBarcode}
                  onChange={(e) => setManualBarcode(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleManualLookup()}
                  placeholder="e.g. 0123456789012"
                />
                <button
                  className="food-save-meal-btn"
                  style={{ flexShrink: 0 }}
                  onClick={handleManualLookup}
                  disabled={!manualBarcode.trim()}
                >
                  Look up
                </button>
              </div>
            </div>
          </>
        )}

        {state === 'loading' && (
          <div className="scanner-status">
            <div className="scanner-spinner" />
            <p>Looking up nutrition info…</p>
          </div>
        )}

        {state === 'not_found' && (
          <div className="scanner-status">
            <p className="scanner-not-found">Product not found in database.</p>
            <p className="scanner-not-found-sub">Try scanning again or enter food details manually.</p>
            <button className="food-save-meal-btn" onClick={handleRetry}>Try again</button>
          </div>
        )}

        {state === 'found' && result && (
          <div className="scanner-result">
            <div className="scanner-result-name">{result.productName}</div>
            {result.brandName && (
              <div className="scanner-result-brand">{result.brandName}</div>
            )}
            <div className="scanner-result-serving">Per {result.servingSize}</div>

            <div className="scanner-macros">
              {result.calories != null && (
                <div className="scanner-macro-item calories">
                  <div className="scanner-macro-val">{result.calories}</div>
                  <div className="scanner-macro-label">kcal</div>
                </div>
              )}
              {result.protein_g != null && (
                <div className="scanner-macro-item protein">
                  <div className="scanner-macro-val">{result.protein_g}g</div>
                  <div className="scanner-macro-label">protein</div>
                </div>
              )}
              {result.carbs_g != null && (
                <div className="scanner-macro-item carbs">
                  <div className="scanner-macro-val">{result.carbs_g}g</div>
                  <div className="scanner-macro-label">carbs</div>
                </div>
              )}
              {result.fat_g != null && (
                <div className="scanner-macro-item fat">
                  <div className="scanner-macro-val">{result.fat_g}g</div>
                  <div className="scanner-macro-label">fat</div>
                </div>
              )}
              {result.fiber_g != null && (
                <div className="scanner-macro-item fiber">
                  <div className="scanner-macro-val">{result.fiber_g}g</div>
                  <div className="scanner-macro-label">fiber</div>
                </div>
              )}
            </div>

            <div className="scanner-result-actions">
              <button className="food-save-meal-btn" style={{ flex: 1 }} onClick={() => onResult(result)}>
                Add to log
              </button>
              <button
                className="food-water-btn"
                style={{ flex: 1 }}
                onClick={handleRetry}
              >
                Scan another
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
