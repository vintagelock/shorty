import React, { useState } from "react";
import {
  MantineProvider,
  TextInput,
  Button,
  Card,
  Group,
  Text,
  Table,
  Badge,
  Alert,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import axios from "axios";

import "@mantine/core/styles.css";

const API_BASE_URL = "http://localhost:3000"; // Update with your backend URL

function App() {
  const [originalUrl, setOriginalUrl] = useState("");
  const [expirationDate, setExpirationDate] = useState("");
  const [shortenedUrl, setShortenedUrl] = useState("");
  const [analytics, setAnalytics] = useState(null);
  const [analyticsId, setAnalyticsId] = useState("");

  const handleShorten = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/shorten`, {
        originalUrl,
        expirationDate: expirationDate || undefined,
      });

      setShortenedUrl(response.data.shortenedUrl);
      showNotification({
        title: "Success",
        message: "URL shortened successfully!",
        color: "green",
      });
    } catch (error) {
      showNotification({
        title: "Error",
        message: error.response?.data?.error || "Failed to shorten URL",
        color: "red",
      });
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/analytics/${analyticsId}`
      );
      setAnalytics(response.data);
    } catch (error) {
      showNotification({
        title: "Error",
        message: error.response?.data?.error || "Failed to fetch analytics",
        color: "red",
      });
    }
  };

  return (
    <MantineProvider
      theme={{ colorScheme: "dark" }}
      withGlobalStyles
      withNormalizeCSS
    >
      <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
        <Card shadow="sm" p="lg" radius="md" withBorder>
          <Text weight={500} size="lg" mb="md">
            URL Shortener
          </Text>

          <TextInput
            label="Original URL"
            placeholder="https://example.com"
            value={originalUrl}
            onChange={(e) => setOriginalUrl(e.target.value)}
            mb="md"
          />

          <TextInput
            label="Expiration Date (optional)"
            placeholder="YYYY-MM-DD"
            value={expirationDate}
            onChange={(e) => setExpirationDate(e.target.value)}
            mb="md"
          />

          <Group position="apart">
            <Button onClick={handleShorten}>Shorten URL</Button>
          </Group>

          {shortenedUrl && (
            <Alert title="Shortened URL" color="teal" mt="md">
              <a href={shortenedUrl} target="_blank" rel="noopener noreferrer">
                {shortenedUrl}
              </a>
            </Alert>
          )}
        </Card>

        <Card shadow="sm" p="lg" radius="md" withBorder mt="xl">
          <Text weight={500} size="lg" mb="md">
            Analytics
          </Text>

          <TextInput
            label="Shortened ID"
            placeholder="Enter shortened ID"
            value={analyticsId}
            onChange={(e) => setAnalyticsId(e.target.value)}
            mb="md"
          />

          <Group position="apart">
            <Button onClick={fetchAnalytics}>Fetch Analytics</Button>
          </Group>

          {analytics && (
            <Table striped highlightOnHover mt="md">
              <thead>
                <tr>
                  <th>IP Address</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {analytics.analytics.map((entry, index) => (
                  <tr key={index}>
                    <td>{entry.ip}</td>
                    <td>{new Date(entry.timestamp).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card>
      </div>
    </MantineProvider>
  );
}

export default App;
