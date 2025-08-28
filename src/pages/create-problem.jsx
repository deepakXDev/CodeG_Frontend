import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export default function CreateProblem() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    descriptionMarkdown: "",
    difficulty: "Easy",
    tags: [],
    timeLimit: 2000,
    memoryLimit: 256,
    testCases: [{ input: "", output: "", isSample: true }],
  });

  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    if (user && user.role !== "Problem_Setter" && user.role !== "Admin") {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRemoveTag = (indexToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((_, index) => index !== indexToRemove),
    }));
  };

  const handleTagKeyDown = (e) => {
    if (e.key === "Backspace" && tagInput === "") {
      e.preventDefault();
      handleRemoveTag(formData.tags.length - 1);
      return;
    }

    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();

      const newTags = tagInput
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);

      if (newTags.length > 0) {
        const updatedTags = [...new Set([...formData.tags, ...newTags])];

        setFormData((prev) => ({ ...prev, tags: updatedTags }));

        setTagInput("");
      }
    }
  };

  const handleTestcaseChange = (index, field, value) => {
    const updatedTestcases = [...formData.testCases];
    updatedTestcases[index][field] = value;
    setFormData((prev) => ({ ...prev, testCases: updatedTestcases }));
  };

  const addTestcase = () => {
    setFormData((prev) => ({
      ...prev,
      testCases: [
        ...prev.testCases,
        { input: "", output: "", isSample: false },
      ],
    }));
  };

  const removeTestcase = (index) => {
    if (formData.testCases.length > 1) {
      const updatedTestcases = formData.testCases.filter((_, i) => i !== index);
      setFormData((prev) => ({ ...prev, testCases: updatedTestcases }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.descriptionMarkdown.trim()) {
      window.showToast &&
        window.showToast("Please fill in all required fields.", "warning");
      return;
    }

    if (
      formData.testCases.some((tc) => !tc.input.trim() || !tc.output.trim())
    ) {
      window.showToast &&
        window.showToast("Please fill in all test cases.", "warning");
      return;
    }

    try {
      setLoading(true);
      console.log(formData);
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/problems`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      if (response.ok) {
        const data = await response.json();
        window.showToast &&
          window.showToast("Problem created successfully!", "success");
        navigate("/my-problems");
      } else {
        const errorData = await response.json();
        window.showToast &&
          window.showToast(
            errorData.message || "Failed to create problem",
            "error"
          );
      }
    } catch (error) {
      console.error("Error creating problem:", error);
      window.showToast && window.showToast("Failed to create problem", "error");
    } finally {
      setLoading(false);
    }
  };

  if (user && user.role !== "Problem_Setter" && user.role !== "Admin") {
    return <AccessDeniedScreen />;
  }

  return (
    <div className="min-h-screen bg-[#1A1A1A] text-gray-300 font-sans pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-7xl">
        <PageHeader navigate={navigate} />
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column for Main Details */}
            <div className="space-y-8">
              <BasicInfoSection
                formData={formData}
                onInputChange={handleInputChange}
                onSelectChange={handleSelectChange}
                tagInput={tagInput}
                onTagInputChange={(e) => setTagInput(e.target.value)}
                onTagKeyDown={handleTagKeyDown}
                onRemoveTag={handleRemoveTag}
              />
              <DescriptionSection
                value={formData.descriptionMarkdown}
                onInputChange={handleInputChange}
              />
            </div>
            {/* Right Column for Test Cases */}
            <div className="space-y-8">
              <TestCasesSection
                testCases={formData.testCases}
                onTestcaseChange={handleTestcaseChange}
                onAddTestcase={addTestcase}
                onRemoveTestcase={removeTestcase}
              />
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-8 mt-8 border-t border-gray-700">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/my-problems")}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-500"
            >
              {loading ? "Creating..." : "Create Problem"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

const PageHeader = ({ navigate }) => (
  <div className="text-center mb-12">
    <h1 className="text-4xl font-bold text-white">Design a New Challenge</h1>
    <p className="text-gray-400 mt-2 text-lg">
      Craft the next problem to test the community's skills.
    </p>
  </div>
);

const BasicInfoSection = ({
  formData,
  onInputChange,
  onSelectChange,
  tagInput,
  onTagInputChange,
  onTagKeyDown,
  onRemoveTag,
}) => (
  <Card className="bg-[#282828] border-gray-700 text-gray-300">
    <CardHeader>
      <CardTitle className="text-white">Core Details</CardTitle>
      <CardDescription>
        Define the fundamental properties of your problem.
      </CardDescription>
    </CardHeader>
    <CardContent className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Problem Title</Label>
        <Input
          id="title"
          name="title"
          value={formData.title}
          onChange={onInputChange}
          placeholder="e.g., Two Sum"
          required
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="difficulty">Difficulty</Label>
          <Select
            name="difficulty"
            value={formData.difficulty}
            onValueChange={(value) => onSelectChange("difficulty", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Easy">Easy</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="Hard">Hard</SelectItem>
              <SelectItem value="Extreme">Extreme</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="tags">Tags (comma-separated)</Label>
          <Input
            id="tags"
            value={tagInput}
            onChange={onTagInputChange}
            onKeyDown={onTagKeyDown}
            placeholder="array, sorting, dp"
          />
          <div className="flex flex-wrap gap-2 pt-2 min-h-[30px]">
            {formData.tags.map((tag, index) => (
              <span
                key={tag}
                className="flex items-center bg-purple-600 text-white px-3 py-1 text-xs rounded-full"
              >
                {tag}
                <button
                  type="button"
                  className="ml-2 text-purple-200 hover:text-white"
                  onClick={() => onRemoveTag(index)}
                >
                  &times;
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="timeLimit">Time Limit (ms)</Label>
          <Input
            id="timeLimit"
            name="timeLimit"
            type="number"
            value={formData.timeLimit}
            onChange={onInputChange}
            min="1000"
            max="10000"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="memoryLimit">Memory Limit (MB)</Label>
          <Input
            id="memoryLimit"
            name="memoryLimit"
            type="number"
            value={formData.memoryLimit}
            onChange={onInputChange}
            min="64"
            max="1024"
            required
          />
        </div>
      </div>
    </CardContent>
  </Card>
);

const DescriptionSection = ({ value, onInputChange }) => (
  <Card className="bg-[#282828] border-gray-700 text-gray-300">
    <CardHeader>
      <CardTitle className="text-white">Problem Statement</CardTitle>
      <CardDescription>
        Provide a clear, detailed description using Markdown for formatting.
      </CardDescription>
    </CardHeader>
    <CardContent>
      <Textarea
        name="descriptionMarkdown"
        value={value}
        onChange={onInputChange}
        rows={15}
        placeholder="## Problem Statement..."
        className="font-mono text-sm"
        required
      />
    </CardContent>
  </Card>
);

const TestCasesSection = ({
  testCases,
  onTestcaseChange,
  onAddTestcase,
  onRemoveTestcase,
}) => (
  <Card className="bg-[#282828] border-gray-700 text-gray-300">
    <CardHeader>
      <div className="flex justify-between items-center">
        <div>
          <CardTitle className="text-white">Test Cases</CardTitle>
          <CardDescription>
            Define inputs and expected outputs. The first case is always a
            sample.
          </CardDescription>
        </div>
        <Button type="button" onClick={onAddTestcase}>
          Add Case
        </Button>
      </div>
    </CardHeader>
    <CardContent className="space-y-4">
      {testCases.map((testcase, index) => (
        <TestCaseInput
          key={index}
          index={index}
          testcase={testcase}
          onTestcaseChange={onTestcaseChange}
          onRemoveTestcase={onRemoveTestcase}
          isRemovable={testCases.length > 1}
        />
      ))}
    </CardContent>
  </Card>
);

const TestCaseInput = ({
  index,
  testcase,
  onTestcaseChange,
  onRemoveTestcase,
  isRemovable,
}) => (
  <div className="bg-[#1A1A1A] p-4 rounded-lg border border-gray-700">
    <div className="flex justify-between items-center mb-4">
      <h4 className="text-sm font-medium text-white">
        Test Case {index + 1}
        {index === 0 && (
          <span className="text-green-400 ml-2 text-xs font-semibold">
            (Sample)
          </span>
        )}
      </h4>
      {isRemovable && (
        <Button
          type="button"
          variant="destructive"
          size="sm"
          onClick={() => onRemoveTestcase(index)}
        >
          Remove
        </Button>
      )}
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor={`input-${index}`} className="text-xs">
          Input
        </Label>
        <Textarea
          id={`input-${index}`}
          value={testcase.input}
          onChange={(e) => onTestcaseChange(index, "input", e.target.value)}
          rows={4}
          className="font-mono text-xs"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`output-${index}`} className="text-xs">
          Expected Output
        </Label>
        <Textarea
          id={`output-${index}`}
          value={testcase.output}
          onChange={(e) => onTestcaseChange(index, "output", e.target.value)}
          rows={4}
          className="font-mono text-xs"
          required
        />
      </div>
    </div>
    {index > 0 && (
      <div className="flex items-center space-x-2 mt-4">
        <Checkbox
          id={`isSample-${index}`}
          checked={testcase.isSample}
          onCheckedChange={(checked) =>
            onTestcaseChange(index, "isSample", checked)
          }
        />
        <Label
          htmlFor={`isSample-${index}`}
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Visible to users as a sample case
        </Label>
      </div>
    )}
  </div>
);

const AccessDeniedScreen = () => (
  <div className="min-h-screen bg-[#1A1A1A] flex items-center justify-center text-center">
    <div>
      <h2 className="text-2xl font-bold text-red-400 mb-4">Access Denied</h2>
      <p className="text-gray-400 mb-6">
        Only Problem Setters and Administrators can access this page.
      </p>
      <Button onClick={() => window.history.back()}>Go Back</Button>
    </div>
  </div>
);
