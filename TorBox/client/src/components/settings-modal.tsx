import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Shield, Eye, EyeOff } from "lucide-react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [apiKey, setApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const { toast } = useToast();

  // Load API key from localStorage on mount
  useEffect(() => {
    const savedApiKey = localStorage.getItem("torbox_api_key") || "";
    setApiKey(savedApiKey);
  }, []);

  const handleSaveSettings = () => {
    // Save API key to localStorage
    if (apiKey.trim()) {
      localStorage.setItem("torbox_api_key", apiKey.trim());
      toast({
        title: "Settings Saved",
        description: "Your TorBox API key has been saved securely.",
      });
    } else {
      localStorage.removeItem("torbox_api_key");
      toast({
        title: "Settings Saved",
        description: "API key has been removed.",
      });
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* API Key Configuration */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">TorBox API Configuration</h4>
            <div className="space-y-3">
              <div>
                <Label htmlFor="api-key" className="block text-sm font-medium text-gray-700 mb-2">
                  TorBox API Key
                </Label>
                <div className="relative">
                  <Input
                    id="api-key"
                    type={showApiKey ? "text" : "password"}
                    placeholder="Enter your TorBox API key"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Get your API key from <a href="https://torbox.app/settings" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">TorBox Settings</a>
                </p>
              </div>
            </div>
          </div>

          {/* Security Note */}
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              <strong>Security Notice</strong><br />
              Your API key is stored locally in your browser and sent directly to TorBox. It is never stored on our servers.
            </AlertDescription>
          </Alert>

          {/* Search Preferences */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Search Preferences</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Checkbox id="show-stats" defaultChecked />
                <Label htmlFor="show-stats" className="text-sm text-gray-700">
                  Show seeders/peers count
                </Label>
              </div>
              <div className="flex items-center space-x-3">
                <Checkbox id="auto-select" />
                <Label htmlFor="auto-select" className="text-sm text-gray-700">
                  Auto-select high quality torrents
                </Label>
              </div>
              <div className="flex items-center space-x-3">
                <Checkbox id="batch-ops" defaultChecked />
                <Label htmlFor="batch-ops" className="text-sm text-gray-700">
                  Enable batch operations
                </Label>
              </div>
            </div>
          </div>

          {/* Results per page */}
          <div>
            <Label className="block text-sm font-semibold text-gray-900 mb-2">
              Results per page
            </Label>
            <Select defaultValue="20">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3 pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSaveSettings}>
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
