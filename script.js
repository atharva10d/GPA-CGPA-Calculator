/**
 * GPA/CGPA Calculator Script
 * Handles SGPA/CGPA calculations, charting, theme toggling,
 * data export (PDF/Screenshot), syllabus display, and user interaction.
 */
document.addEventListener('DOMContentLoaded', () => {

    // --- Element References ---
    const greeting = document.getElementById('greeting');
    const initialChoice = document.getElementById('initial-choice');
    const cgpaSection = document.getElementById('cgpa-section');
    const sgpaSection = document.getElementById('sgpa-section');
    const chooseSgpaBtn = document.getElementById('choose-sgpa');
    const chooseCgpaBtn = document.getElementById('choose-cgpa');
    const backButtons = document.querySelectorAll('.back-button');

    // CGPA Elements
    const currentYearCgpaSelect = document.getElementById('current-year-cgpa');
    const cgpaBranchSelect = document.getElementById('cgpa-branch');
    const previousSemestersDiv = document.getElementById('previous-semesters');
    const calculateCgpaBtn = document.getElementById('calculate-cgpa');
    const cgpaResultDiv = document.getElementById('cgpa-result');
    const percentageResultDiv = document.getElementById('percentage-result');
    const cgpaChartContainer = document.getElementById('cgpa-chart-container');
    const cgpaCanvas = document.getElementById('cgpa-chart')?.getContext('2d'); // Use optional chaining
    const cgpaPromptMessage = document.getElementById('cgpa-prompt-message');
    let cgpaChartInstance = null;

    // SGPA Elements
    const branchSelect = document.getElementById('branch');
    const yearSgpaSelect = document.getElementById('year-sgpa');
    const oddSemRadio = document.getElementById('odd-sem');
    const evenSemRadio = document.getElementById('even-sem');
    const semesterTypeRadios = document.querySelectorAll('input[name="semester-type"]');
    const subjectInputsDiv = document.getElementById('subject-inputs');
    const calculateSgpaBtn = document.getElementById('calculate-sgpa');
    const sgpaResultDiv = document.getElementById('sgpa-result');
    const sgpaChartContainer = document.getElementById('sgpa-chart-container');
    const sgpaCanvas = document.getElementById('sgpa-chart')?.getContext('2d'); // Use optional chaining
    let sgpaChartInstance = null;

    // Common Elements
    const toggleDarkModeBtn = document.getElementById('toggle-dark-mode');
    const saveScreenBtn = document.getElementById('save-screen');
    const exportPdfBtn = document.getElementById('export-pdf');
    const syllabusContentDiv = document.getElementById('syllabus-content');
    const gradingTableBody = document.querySelector('#grading-table tbody');

    // Enhanced Feature Elements
    const comparisonModal = document.getElementById('comparison-modal');
    const helpModal = document.getElementById('help-modal');
    const feedbackModal = document.getElementById('feedback-modal');
    const closeModalBtns = document.querySelectorAll('.close-modal');
    const calculateComparisonBtn = document.getElementById('calculate-comparison');
    const resetDataBtn = document.getElementById('reset-data');
    const helpBtn = document.getElementById('help-button');
    const feedbackBtn = document.getElementById('feedback-button');
    const feedbackForm = document.getElementById('feedback-form');
    const comparisonChartCanvas = document.getElementById('comparison-chart')?.getContext('2d'); // Use optional chaining
    let comparisonChartInstance = null;

    // --- Data and Constants ---
    const MAX_SEMESTERS = 8;
    const CAPTURE_RENDER_DELAY = 350; // Milliseconds delay before screen/pdf capture

    // --- Syllabus Data Object ---
    // IMPORTANT: Keep this data accurate and complete for calculations.
    const syllabusData = {
        'FE': {
            years: [1],
            1: {
                'odd': { // Sem I
                    subjects: [
                        { name: "Engineering Mathematics I", credits: 5 }, { name: "Engineering Physics", credits: 5 }, // Assuming one physics/chem sequence
                        { name: "Engineering Graphics I", credits: 4 }, { name: "Basic Electrical Engineering", credits: 4 }, // Assuming one elec/electro sequence
                        { name: "Basic Civil & Environmental Engineering", credits: 4 }, { name: "Fundamentals of Programming Languages I", credits: 2 },
                        { name: "Workshop Practice (Lab)", credits: 1 }
                    ]
                },
                'even': { // Sem II
                    subjects: [
                        { name: "Engineering Mathematics II", credits: 4 }, { name: "Engineering Chemistry", credits: 5 }, // The other in the sequence
                        { name: "Basic Mechanical Engineering", credits: 4 }, { name: "Engineering Mechanics", credits: 5 },
                        { name: "Basic Electronics Engineering", credits: 4 }, // The other in the sequence
                        { name: "Fundamentals of Programming Languages II", credits: 2 },
                        { name: "Engineering Graphics II", credits: 1 }
                    ]
                }
            }
        },
        'Comp/IT': { // Combined Computer / IT (Adjust if significant differences)
            years: [2, 3, 4],
            2: {
                'odd': { subjects: [ { name: "Discrete Mathematics", credits: 4 }, { name: "Data Structures & Algorithms", credits: 4 }, { name: "Object Oriented Programming", credits: 4 }, { name: "Computer Graphics", credits: 3 }, { name: "Digital Electronics & Logic Design", credits: 3 }, { name: "Soft Skills", credits: 1 } ] },
                'even': { subjects: [ { name: "Engineering Mathematics III", credits: 4 }, { name: "Computer Organization & Architecture", credits: 3 }, { name: "Database Management Systems", credits: 4 }, { name: "Operating Systems", credits: 4 }, { name: "Theory of Computation", credits: 3 }, { name: "Programming Skill Development Lab", credits: 1 } ] }
            },
            3: {
                'odd': { subjects: [ { name: "Database Management Systems(Lab)", credits: 3 }, { name: "Operating Systems(Lab)", credits: 2 }, { name: "Computer Networks & Security", credits: 3 }, { name: "Artificial Intelligence", credits: 3 }, { name: "Web Technology", credits: 3 }, { name: "Seminar", credits: 1 } ] },
                'even': { subjects: [ { name: "Software Engineering & Project Management", credits: 3 }, { name: "Compiler Design", credits: 3 }, { name: "Data Science & Big Data Analytics", credits: 4 }, { name: "Machine Learning", credits: 3 }, { name: "Lab Practice II (Web + ML)", credits: 2 } ] }
            },
            4: {
                'odd': { subjects: [ { name: "Cloud Computing", credits: 3 }, { name: "Cyber Security", credits: 3 }, { name: "Elective III", credits: 3 }, { name: "Elective IV", credits: 3 }, { name: "Project Stage I", credits: 2 } ] },
                'even': { subjects: [ { name: "Internet of Things", credits: 3 }, { name: "Elective V", credits: 3 }, { name: "Elective VI", credits: 3 }, { name: "Project Stage II", credits: 6 } ] }
            }
        },
        'ENTC/Elec': { // Combined ENTC / Electronics (Adjust if needed)
             years: [2, 3, 4],
             2: {
                 'odd': { subjects: [ { name: "Engineering Mathematics III", credits: 4 },{ name: "Digital Electronics", credits: 3 }, { name: "Electrical Circuits", credits: 4 },{ name: "Signals & Systems", credits: 4 }, { name: "Electronic Devices & Circuits", credits: 3} ] },
                 'even': { subjects: [ { name: "Control Systems", credits: 3 },{ name: "Analog Circuits", credits: 4 }, { name: "Microcontrollers", credits: 4 },{ name: "Electromagnetics", credits: 3 }, { name: "Data Structures & Algo (E&TC)", credits: 3} ] }
             },
             3: {
                  'odd': { subjects: [ { name: "Digital Communication", credits: 3 },{ name: "Electromagnetic Field Theory", credits: 3 }, { name: "Database Management", credits: 3 },{ name: "Power Electronics", credits: 3}, { name: "Mechatronics", credits: 3} ] },
                  'even': { subjects: [ { name: "Information Theory & Coding Techniques", credits: 3 },{ name: "Antenna & Wave Propagation", credits: 3 }, { name: "Embedded Systems & RTOS", credits: 3 },{ name: "VLSI Design", credits: 4}, { name: "Business Management", credits: 3} ] }
             },
             4: {
                  'odd': { subjects: [ { name: "Microwave Engineering", credits: 3 },{ name: "Digital Signal Processing", credits: 4 }, { name: "Elective I", credits: 3 },{ name: "Elective II", credits: 3 }, { name: "Project Stage I", credits: 2} ] },
                  'even': { subjects: [ { name: "Mobile Communication", credits: 3 },{ name: "Broadband Communication Systems", credits: 3 }, { name: "Elective III", credits: 3 }, { name: "Elective IV", credits: 3 }, { name: "Project Stage II", credits: 6 } ] }
             }
        },
        'Mech': {
              years: [2, 3, 4],
              2: {
                  'odd': { subjects: [ { name: "Engineering Mathematics III", credits: 4 },{ name: "Thermodynamics", credits: 4 }, { name: "Strength of Materials", credits: 4 },{ name: "Fluid Mechanics", credits: 3 }, { name: "Manufacturing Processes I", credits: 3} ] },
                  'even': { subjects: [ { name: "Theory of Machines I", credits: 4 },{ name: "Engineering Metallurgy", credits: 3 }, { name: "Applied Thermodynamics", credits: 4 },{ name: "Electrical & Electronics Engg.", credits: 3 }, { name: "Machine Shop Practice I", credits: 1} ] }
              },
              3: {
                   'odd': { subjects: [ { name: "Design of Machine Elements I", credits: 4 },{ name: "Heat Transfer", credits: 4 }, { name: "Theory of Machines II", credits: 4 },{ name: "Mechatronics", credits: 3}, { name: "Manufacturing Processes II", credits: 3} ] },
                   'even': { subjects: [ { name: "Numerical Methods & Optimization", credits: 4 },{ name: "Design of Machine Elements II", credits: 4 }, { name: "Turbo Machines", credits: 4 },{ name: "Metrology & Quality Control", credits: 3}, { name: "Seminar", credits: 1} ] }
              },
              4: {
                   'odd': { subjects: [ { name: "Refrigeration & Air Conditioning", credits: 4 },{ name: "CAD/CAM Automation", credits: 4 }, { name: "Dynamics of Machinery", credits: 4 },{ name: "Elective I", credits: 3 }, { name: "Project Stage I", credits: 2} ] },
                   'even': { subjects: [ { name: "Energy Engineering", credits: 3 },{ name: "Mechanical System Design", credits: 4 }, { name: "Elective II", credits: 3 },{ name: "Elective III", credits: 3 }, { name: "Project Stage II", credits: 6 } ] }
              }
        },
         'Civil': {
              years: [2, 3, 4],
              2: {
                  'odd': { subjects: [ { name: "Engineering Mathematics III", credits: 4 },{ name: "Building Technology & Materials", credits: 4 }, { name: "Strength of Materials", credits: 4 },{ name: "Surveying", credits: 4 }, { name: "Geotechnical Engineering", credits: 3} ] },
                  'even': { subjects: [ { name: "Fluid Mechanics I", credits: 4 },{ name: "Structural Analysis I", credits: 4 }, { name: "Engineering Geology", credits: 3 },{ name: "Concrete Technology", credits: 4 }, { name: "Project Management & Engg. Economics", credits: 3} ] }
              },
              3: {
                   'odd': { subjects: [ { name: "Structural Analysis II", credits: 4 },{ name: "Fluid Mechanics II", credits: 3 }, { name: "Infrastructure Engg. & Construction Techniques", credits: 4 },{ name: "Advanced Surveying", credits: 3}, { name: "Foundation Engineering", credits: 4} ] },
                   'even': { subjects: [ { name: "Hydrology & Water Resource Engineering", credits: 4 },{ name: "Structural Design I (RCC)", credits: 4 }, { name: "Transportation Engineering", credits: 3 },{ name: "Environmental Engineering I", credits: 4 }, { name: "Seminar", credits: 1} ] }
              },
              4: {
                   'odd': { subjects: [ { name: "Environmental Engineering II", credits: 3 },{ name: "Structural Design II (Steel)", credits: 4 }, { name: "Quantity Surveying, Contracts & Tenders", credits: 4 },{ name: "Elective I", credits: 3 }, { name: "Elective II", credits: 3 },{ name: "Project Stage I", credits: 2} ] },
                   'even': { subjects: [ { name: "Dams & Hydraulic Structures", credits: 4 },{ name: "Elective III", credits: 3 }, { name: "Elective IV", credits: 3 },{ name: "Project Stage II", credits: 6 } ] }
              }
        }
        // Add other branches following the same structure
    };

    // --- Helper Functions ---
    function showSection(sectionToShow) {
        // Hide all main sections first
        [initialChoice, cgpaSection, sgpaSection].forEach(sec => sec.classList.replace('active', 'hidden'));
        // Show the target section
        sectionToShow.classList.replace('hidden', 'active');
        sectionToShow.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function clearValidationErrors(container) {
        container.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
        container.querySelectorAll('.error-text').forEach(el => el.classList.remove('error-text')); // Also clear text errors
        const errorDiv = container.querySelector('.result.error-message');
        if (errorDiv) {
            errorDiv.textContent = '';
            errorDiv.classList.add('hidden');
            errorDiv.classList.remove('error-message'); // Remove error styling class
        }
    }

    function displayErrorMessage(container, message, resultDiv) {
        resultDiv.textContent = message;
        resultDiv.classList.remove('hidden');
        resultDiv.classList.add('error-message'); // Add class for error styling
        // Hide associated charts on error
        if (container === sgpaSection) sgpaChartContainer?.classList.add('hidden');
        if (container === cgpaSection) cgpaChartContainer?.classList.add('hidden');
    }

    function populateSyllabusInfo() {
         if (!syllabusContentDiv) return;
         syllabusContentDiv.innerHTML = ''; // Clear previous content
         try {
             for (const branchKey in syllabusData) {
                 const branchData = syllabusData[branchKey];
                 const branchDiv = document.createElement('div');
                 branchDiv.classList.add('syllabus-branch');

                 const branchTitle = document.createElement('h4');
                 let branchName = '';
                 // Find corresponding option text in dropdowns for a user-friendly name
                 const optionCgpa = Array.from(cgpaBranchSelect?.options || []).find(opt => opt.value === branchKey);
                 const optionSgpa = Array.from(branchSelect?.options || []).find(opt => opt.value === branchKey);

                 if(branchKey === 'FE') branchName = 'First Year (Common to All Branches)';
                 else branchName = optionCgpa?.text || optionSgpa?.text || branchKey; // Use dropdown text or key

                 branchTitle.textContent = branchName;
                 branchDiv.appendChild(branchTitle);

                 branchData.years.forEach(year => {
                     const yearData = branchData[year]; if (!yearData) return;
                     const semTypes = Object.keys(yearData).sort((a, b) => (a === 'odd' ? -1 : 1)); // Odd first

                     semTypes.forEach(semType => {
                         const semesterData = yearData[semType];
                         if (!semesterData || !Array.isArray(semesterData.subjects) || semesterData.subjects.length === 0) return;

                         const semTitle = document.createElement('h5');
                         let semNumRoman = '';
                         let calculatedTotalCredits = 0;
                         try {
                             calculatedTotalCredits = semesterData.subjects.reduce((sum, subject) => {
                                 if (typeof subject.credits !== 'number' || isNaN(subject.credits) || subject.credits <= 0) {
                                     console.warn(`Invalid credit for ${subject.name} in ${branchName} Year ${year} ${semType}`);
                                     return sum; // Skip invalid credits in sum
                                 }
                                 return sum + subject.credits;
                             }, 0);
                         } catch (e) {
                             console.error(`Error calculating credits for ${branchName} Year ${year} Sem ${semType}:`, e);
                             calculatedTotalCredits = null; // Mark as calculation failed
                         }

                         // Determine Roman numeral for semester
                         const semNum = (year - 1) * 2 + (semType === 'odd' ? 1 : 2);
                         const romanMap = { 1: 'I', 2: 'II', 3: 'III', 4: 'IV', 5: 'V', 6: 'VI', 7: 'VII', 8: 'VIII' };
                         semNumRoman = romanMap[semNum] || semNum.toString(); // Fallback to number

                         const totalCreditsText = calculatedTotalCredits !== null ? ` (Total Credits: ${calculatedTotalCredits})` : ' (Credits N/A)';
                         semTitle.textContent = `Semester ${semNumRoman} (${semType.charAt(0).toUpperCase() + semType.slice(1)})${totalCreditsText}`;

                         const subjectList = document.createElement('ul');
                         semesterData.subjects.forEach(subject => {
                             const li = document.createElement('li');
                             const creditText = (typeof subject.credits === 'number' && subject.credits > 0) ? ` (${subject.credits} Cr)` : ' (Cr: N/A)';
                             li.textContent = `${subject.name} ${creditText}`;
                             subjectList.appendChild(li);
                         });
                         branchDiv.appendChild(semTitle);
                         branchDiv.appendChild(subjectList);
                     });
                 });
                 syllabusContentDiv.appendChild(branchDiv);
             }
         } catch (error) {
             console.error("Error populating syllabus info:", error);
             syllabusContentDiv.innerHTML = '<p class="error-text">Could not load syllabus details. Please check the console for errors.</p>';
         }
    }

    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        const icon = toggleDarkModeBtn?.querySelector('i');
        if (icon) {
            icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
        // Update chart themes if they exist
        [cgpaChartInstance, sgpaChartInstance, comparisonChartInstance].forEach(chart => {
            if (chart) {
                // Basic theme update - might need more specific color changes depending on chart library version/options
                const isDark = theme === 'dark';
                const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
                const labelColor = isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)';

                chart.options.scales.x.ticks.color = labelColor;
                chart.options.scales.y.ticks.color = labelColor;
                chart.options.scales.x.grid.color = gridColor;
                chart.options.scales.y.grid.color = gridColor;
                if(chart.options.plugins.title) chart.options.plugins.title.color = labelColor;
                if(chart.options.plugins.legend) chart.options.plugins.legend.labels.color = labelColor;

                chart.update();
            }
        });
    }

    function getGradePointFromMarks(marks) {
        if (marks === null || typeof marks !== 'number' || isNaN(marks)) return 0; // Treat invalid/missing as 0 GP for calculation robustness? Or null? Let's stick to 0 for now.
        marks = Math.round(marks); // Round marks before grading
        if (marks < 0 || marks > 100) return 0; // Invalid range
        if (marks >= 90) return 10;
        if (marks >= 80) return 9;
        if (marks >= 70) return 8;
        if (marks >= 60) return 7;
        if (marks >= 50) return 6;
        if (marks >= 45) return 5;
        if (marks >= 40) return 4;
        return 0; // Marks below 40
    }

    // --- Navigation Event Listeners ---
    chooseSgpaBtn?.addEventListener('click', () => showSection(sgpaSection));
    chooseCgpaBtn?.addEventListener('click', () => {
        resetCgpaSection(); // Reset before showing
        showSection(cgpaSection);
    });

    backButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetId = button.getAttribute('data-target');
            const hideId = button.getAttribute('data-hide');
            const sectionToHide = document.getElementById(hideId);
            const sectionToShow = document.getElementById(targetId);

            if (sectionToHide) {
                sectionToHide.classList.replace('active', 'hidden');
                clearValidationErrors(sectionToHide); // Clear errors when navigating away
                // Hide results/charts specifically for the section being hidden
                if (sectionToHide === sgpaSection) {
                    sgpaResultDiv?.classList.add('hidden');
                    sgpaChartContainer?.classList.add('hidden');
                    if (sgpaChartInstance) { sgpaChartInstance.destroy(); sgpaChartInstance = null; }
                } else if (sectionToHide === cgpaSection) {
                    cgpaResultDiv?.classList.add('hidden');
                    percentageResultDiv?.classList.add('hidden');
                    cgpaChartContainer?.classList.add('hidden');
                    if (cgpaChartInstance) { cgpaChartInstance.destroy(); cgpaChartInstance = null; }
                }
            }
            if (sectionToShow) {
                showSection(sectionToShow);
            } else {
                console.warn(`Back button target '${targetId}' not found.`);
                showSection(initialChoice); // Fallback to initial choice
            }
        });
     });

    // --- CGPA Calculation Logic ---
    function getTotalCreditsForSemester(branch, semesterNum) {
        if (!branch && semesterNum > 2) return null; // Cannot determine credits without branch for SE onwards
        // Use 'FE' for first two semesters regardless of selected branch
        const effectiveBranch = (semesterNum === 1 || semesterNum === 2) ? 'FE' : branch;

        if (!syllabusData[effectiveBranch]) {
            console.error(`Syllabus data missing for effective branch: ${effectiveBranch} (derived from branch: ${branch}, sem: ${semesterNum})`);
            return null;
        }
        const year = Math.ceil(semesterNum / 2);
        const semType = (semesterNum % 2 !== 0) ? 'odd' : 'even';
        const subjectsArray = syllabusData[effectiveBranch]?.[year]?.[semType]?.subjects;

        if (Array.isArray(subjectsArray) && subjectsArray.length > 0) {
            try {
                const total = subjectsArray.reduce((sum, subject) => {
                    const credit = subject.credits;
                    // Stricter validation: Must be a positive number
                    if (typeof credit !== 'number' || isNaN(credit) || credit <= 0) {
                        console.error(`Invalid credit value (${credit}) for subject: "${subject.name}" in ${effectiveBranch} Sem ${semesterNum}`);
                        throw new Error("Invalid credit found"); // Stop calculation if credits are bad
                    }
                    return sum + credit;
                }, 0);
                return total > 0 ? total : null; // Return null if total credits ended up being 0
            } catch (error) {
                return null; // Return null if an error occurred during summation
            }
        } else {
            console.warn(`Subjects array not found or empty for Branch: ${effectiveBranch}, Year: ${year}, SemType: ${semType}`);
            return null; // Return null if no subjects defined
        }
    }

    function updateCgpaSemesterRows() {
        if (!currentYearCgpaSelect || !cgpaBranchSelect || !previousSemestersDiv || !cgpaPromptMessage || !calculateCgpaBtn) return;

        const selectedYear = parseInt(currentYearCgpaSelect.value);
        const selectedBranch = cgpaBranchSelect.value;

        // Clear previous rows
        previousSemestersDiv.innerHTML = '<h3><i class="fas fa-history"></i> Enter Previous Semester Details:</h3>';
        cgpaResultDiv?.classList.add('hidden');
        percentageResultDiv?.classList.add('hidden');
        cgpaChartContainer?.classList.add('hidden');
        if (cgpaChartInstance) { cgpaChartInstance.destroy(); cgpaChartInstance = null; }
        clearValidationErrors(cgpaSection);

        if (selectedYear > 0 && selectedBranch) {
            cgpaPromptMessage.classList.add('hidden'); // Hide prompt message
            calculateCgpaBtn.disabled = false;
            calculateCgpaBtn.title = 'Calculate CGPA';

            const maxSemester = selectedYear * 2;
            let allCreditsFound = true;

            for (let semNum = 1; semNum <= maxSemester; semNum++) {
                const totalCredits = getTotalCreditsForSemester(selectedBranch, semNum);
                const creditsText = totalCredits !== null ? totalCredits : 'N/A';
                const creditValue = totalCredits !== null ? totalCredits : '';
                if (totalCredits === null) allCreditsFound = false;

                const div = document.createElement('div');
                div.classList.add('semester-input-row');
                div.setAttribute('data-sem-num', semNum);

                const romanMap = { 1: 'I', 2: 'II', 3: 'III', 4: 'IV', 5: 'V', 6: 'VI', 7: 'VII', 8: 'VIII' };
                const semLabelText = `Sem ${romanMap[semNum] || semNum} SGPA:`;

                div.innerHTML = `
                    <label class="sem-label" for="sgpa-sem-${semNum}">${semLabelText}</label>
                    <input type="number" id="sgpa-sem-${semNum}" data-semester="${semNum}" step="0.01" min="0" max="10" placeholder="0.00 - 10.00" required>
                    <span class="credit-display ${totalCredits === null ? 'error-text' : ''}">Credits: ${creditsText}</span>
                    <input type="hidden" class="credit-value" value="${creditValue}">
                `;
                previousSemestersDiv.appendChild(div);

                // Apply real-time validation to the newly added input
                const newInput = div.querySelector('input[type="number"]');
                if (newInput) createRealTimeValidation(newInput, 0, 10); // SGPA is 0-10
            }

            if (!allCreditsFound) {
                 // Display a non-error warning if credits are missing
                 cgpaResultDiv.textContent = "Warning: Credit data missing or invalid for some semesters (marked N/A or red). CGPA calculation might be inaccurate. Please verify syllabus data.";
                 cgpaResultDiv.classList.remove('hidden', 'error-message');
                 cgpaResultDiv.style.color = 'orange'; // Use a warning color
                 cgpaResultDiv.style.fontWeight = 'bold';
            } else {
                // Clear any previous warning if all credits are now found
                 cgpaResultDiv.classList.add('hidden');
                 cgpaResultDiv.style.color = ''; // Reset style
                 cgpaResultDiv.style.fontWeight = '';
            }

        } else {
            cgpaPromptMessage.classList.remove('hidden'); // Show prompt message
            calculateCgpaBtn.disabled = true;
            calculateCgpaBtn.title = 'Select year and branch first';
            previousSemestersDiv.appendChild(cgpaPromptMessage); // Ensure prompt is visible
        }
    }

    function resetCgpaSection() {
        if (currentYearCgpaSelect) currentYearCgpaSelect.value = '';
        if (cgpaBranchSelect) cgpaBranchSelect.value = '';
        if (previousSemestersDiv) {
            previousSemestersDiv.innerHTML = '<h3><i class="fas fa-history"></i> Enter Previous Semester Details:</h3>';
            if (cgpaPromptMessage) {
                previousSemestersDiv.appendChild(cgpaPromptMessage);
                cgpaPromptMessage.classList.remove('hidden');
            }
        }
        if (calculateCgpaBtn) {
            calculateCgpaBtn.disabled = true;
            calculateCgpaBtn.title = 'Select year and branch first';
        }
        if (cgpaResultDiv) {
            cgpaResultDiv.classList.add('hidden');
            cgpaResultDiv.classList.remove('error-message');
            cgpaResultDiv.style.color = ''; // Reset warning style
             cgpaResultDiv.style.fontWeight = '';
        }
        if (percentageResultDiv) percentageResultDiv.classList.add('hidden');
        if (cgpaChartContainer) cgpaChartContainer.classList.add('hidden');
        if (cgpaChartInstance) { cgpaChartInstance.destroy(); cgpaChartInstance = null; }
        clearValidationErrors(cgpaSection);
    }

    currentYearCgpaSelect?.addEventListener('change', updateCgpaSemesterRows);
    cgpaBranchSelect?.addEventListener('change', updateCgpaSemesterRows);

    calculateCgpaBtn?.addEventListener('click', () => {
        clearValidationErrors(cgpaSection);
        // Reset potential warning styles before calculation
        if (cgpaResultDiv) {
             cgpaResultDiv.style.color = ''; cgpaResultDiv.style.fontWeight = '';
             cgpaResultDiv.classList.remove('error-message'); // Ensure error class is removed
        }

        const semesterRows = previousSemestersDiv?.querySelectorAll('.semester-input-row');
        if (!semesterRows || semesterRows.length === 0) {
            displayErrorMessage(cgpaSection, 'No semester data found. Select Year and Branch, then enter SGPA values.', cgpaResultDiv);
            return;
        }

        let totalWeightedSgpa = 0;
        let totalCreditsSum = 0;
        const semesterData = [];
        let isValid = true;
        let firstInvalidInput = null;
        let missingCredits = false;

        semesterRows.forEach((row) => {
            const sgpaInput = row.querySelector('input[type="number"]');
            const creditValueInput = row.querySelector('.credit-value');
            const creditDisplaySpan = row.querySelector('.credit-display');
            const semesterNumber = parseInt(row.getAttribute('data-sem-num'));

            // Validate SGPA Input
            const sgpaStr = sgpaInput.value.trim();
            const sgpa = parseFloat(sgpaStr);
            if (sgpaStr === '' || !Number.isFinite(sgpa) || sgpa < 0 || sgpa > 10) {
                sgpaInput.classList.add('error');
                isValid = false;
                if (!firstInvalidInput) firstInvalidInput = sgpaInput;
            } else {
                sgpaInput.classList.remove('error'); // Remove error if valid
            }

            // Validate Credits (must exist and be positive)
            const creditsStr = creditValueInput.value;
            const credits = parseInt(creditsStr);
            if (!Number.isFinite(credits) || credits <= 0) {
                isValid = false; // Cannot calculate without valid credits
                missingCredits = true;
                creditDisplaySpan?.classList.add('error-text');
                console.error(`Invalid/missing credits (${creditsStr}) detected for semester ${semesterNumber}.`);
                if (!firstInvalidInput) firstInvalidInput = sgpaInput; // Focus related SGPA input
            } else {
                creditDisplaySpan?.classList.remove('error-text'); // Remove error if valid
            }

            // If both SGPA and credits for this row are valid, accumulate
            if (Number.isFinite(sgpa) && sgpa >= 0 && sgpa <= 10 && Number.isFinite(credits) && credits > 0) {
                totalWeightedSgpa += sgpa * credits;
                totalCreditsSum += credits;
                semesterData.push({ semester: semesterNumber, sgpa: sgpa, credits: credits });
            }
        });

        // Sort data for the chart
        semesterData.sort((a, b) => a.semester - b.semester);

        if (!isValid) {
            let errorMsg = 'Please enter valid SGPA values (0.00 - 10.00) for all highlighted semesters.';
            if (missingCredits) {
                errorMsg += ' Additionally, credit data is missing or invalid for some semesters (marked red/N/A). Calculation cannot proceed accurately.';
            }
            displayErrorMessage(cgpaSection, errorMsg, cgpaResultDiv);
            percentageResultDiv?.classList.add('hidden');
            cgpaChartContainer?.classList.add('hidden');
            firstInvalidInput?.focus();
            return;
        }

        if (totalCreditsSum <= 0) {
            displayErrorMessage(cgpaSection, 'Total valid credits must be greater than 0 to calculate CGPA. Check semester credit data.', cgpaResultDiv);
            percentageResultDiv?.classList.add('hidden');
            cgpaChartContainer?.classList.add('hidden');
            return;
        }

        const cgpa = totalWeightedSgpa / totalCreditsSum;
        // Standard SPPU Percentage Conversion (Example: CGPA * 10). Verify official guidelines.
        const percentage = (cgpa * 10); // Simple conversion, adjust if needed

        cgpaResultDiv.textContent = `Overall CGPA: ${cgpa.toFixed(2)}`;
        cgpaResultDiv.classList.remove('hidden', 'error-message');

        percentageResultDiv.textContent = `Equivalent Percentage: ${percentage.toFixed(2)}%`;
        percentageResultDiv.classList.remove('hidden');

        // --- CGPA Chart Creation ---
        if (cgpaChartInstance) cgpaChartInstance.destroy();
        if (!cgpaCanvas || !cgpaChartContainer) {
            console.warn("CGPA chart canvas or container not found. Skipping chart.");
            return;
        }

        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
        const labelColor = isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)';

        cgpaChartInstance = new Chart(cgpaCanvas, {
            type: 'line',
            data: {
                labels: semesterData.map(d => `Sem ${d.semester}`),
                datasets: [{
                    label: 'SGPA per Semester',
                    data: semesterData.map(d => d.sgpa),
                    borderColor: 'rgb(75, 192, 192)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    tension: 0.2,
                    fill: true,
                    pointBackgroundColor: 'rgb(75, 192, 192)',
                    pointRadius: 5,
                    pointHoverRadius: 7
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 10,
                        title: { display: true, text: 'SGPA', color: labelColor },
                        ticks: { color: labelColor },
                        grid: { color: gridColor }
                    },
                     x: {
                         title: { display: true, text: 'Semester', color: labelColor },
                         ticks: { color: labelColor },
                         grid: { color: gridColor }
                     }
                },
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    tooltip: {
                        mode: 'index',
                        intersect: false
                    },
                    title: { display: false }, // Using HTML H3 for title
                    legend: { labels: { color: labelColor } }
                },
                animation: { // Keep animations enabled by default
                    duration: 800
                }
            }
        });
        cgpaChartContainer.classList.remove('hidden');
    });


    // --- SGPA Calculation Logic ---
    function updateYearOptionsSGPA() {
        if (!branchSelect || !yearSgpaSelect || !oddSemRadio || !evenSemRadio || !subjectInputsDiv || !calculateSgpaBtn) return;

        const selectedBranch = branchSelect.value;
        yearSgpaSelect.innerHTML = '<option value="">-- Select Year --</option>'; // Reset
        yearSgpaSelect.disabled = true;
        oddSemRadio.disabled = true; evenSemRadio.disabled = true;
        oddSemRadio.checked = false; evenSemRadio.checked = false;
        subjectInputsDiv.innerHTML = '<h3><i class="fas fa-book"></i> Enter Subject Details (Marks out of 100):</h3>'; // Reset subjects
        calculateSgpaBtn.disabled = true;
        sgpaResultDiv?.classList.add('hidden');
        sgpaChartContainer?.classList.add('hidden');
        if (sgpaChartInstance) { sgpaChartInstance.destroy(); sgpaChartInstance = null; }
        clearValidationErrors(sgpaSection);

        if (selectedBranch && syllabusData[selectedBranch]?.years) {
            syllabusData[selectedBranch].years.forEach(year => {
                 const option = document.createElement('option');
                 option.value = year;
                 const yearMap = { 1: 'First Year', 2: 'Second Year', 3: 'Third Year', 4: 'Fourth Year' };
                 option.textContent = yearMap[year] || `Year ${year}`;
                 yearSgpaSelect.appendChild(option);
             });
             yearSgpaSelect.disabled = false;
        }
    }

    function updateSemesterOptionsSGPA() {
         if (!branchSelect || !yearSgpaSelect || !oddSemRadio || !evenSemRadio || !subjectInputsDiv || !calculateSgpaBtn) return;

        const selectedBranch = branchSelect.value;
        const selectedYear = yearSgpaSelect.value;
        // Disable radios first
        oddSemRadio.disabled = true; evenSemRadio.disabled = true;
        oddSemRadio.checked = false; evenSemRadio.checked = false; // Uncheck them
        subjectInputsDiv.innerHTML = '<h3><i class="fas fa-book"></i> Enter Subject Details (Marks out of 100):</h3>'; // Reset subjects
        calculateSgpaBtn.disabled = true;
        sgpaResultDiv?.classList.add('hidden');
        sgpaChartContainer?.classList.add('hidden');
        if (sgpaChartInstance) { sgpaChartInstance.destroy(); sgpaChartInstance = null; }
        clearValidationErrors(sgpaSection);

        if(selectedBranch && selectedYear && syllabusData[selectedBranch]?.[selectedYear]){
            // Enable radios only if corresponding semester data exists with valid subjects
            if(syllabusData[selectedBranch][selectedYear]['odd']?.subjects?.length > 0) {
                oddSemRadio.disabled = false;
            }
            if(syllabusData[selectedBranch][selectedYear]['even']?.subjects?.length > 0) {
                evenSemRadio.disabled = false;
            }
        }
    }

    function populateSubjectsSGPA() {
        if (!branchSelect || !yearSgpaSelect || !subjectInputsDiv || !calculateSgpaBtn) return;

        const branch = branchSelect.value;
        const year = yearSgpaSelect.value;
        const semType = document.querySelector('input[name="semester-type"]:checked')?.value;

        subjectInputsDiv.innerHTML = '<h3><i class="fas fa-book"></i> Enter Subject Details (Marks out of 100):</h3>'; // Reset subjects
        calculateSgpaBtn.disabled = true;
        sgpaResultDiv?.classList.add('hidden');
        sgpaChartContainer?.classList.add('hidden');
        if (sgpaChartInstance) { sgpaChartInstance.destroy(); sgpaChartInstance = null; }
        clearValidationErrors(sgpaSection);

        if (branch && year && semType && syllabusData[branch]?.[year]?.[semType]?.subjects) {
            const subjects = syllabusData[branch][year][semType].subjects;
            if (subjects.length === 0) {
                subjectInputsDiv.innerHTML += '<p class="info-text">No subjects defined for this selection in the syllabus data.</p>';
                return; // Stop if no subjects
            }

            let subjectsAdded = 0;
            subjects.forEach((subject, index) => {
                // Validate credits before adding the row
                if (typeof subject.credits !== 'number' || isNaN(subject.credits) || subject.credits <= 0) {
                    console.error(`Invalid credit (${subject.credits}) for subject "${subject.name}" in ${branch} Year ${year} ${semType}. Skipping subject.`);
                     subjectInputsDiv.innerHTML += `<p class="error-text">Warning: Subject "${subject.name}" has invalid credits (${subject.credits || 'N/A'}) and was skipped.</p>`;
                    return; // Skip adding this subject row
                }

                const div = document.createElement('div');
                div.classList.add('subject-input-row');
                const inputId = `marks-${branch}-${year}-${semType}-${index}`;
                div.innerHTML = `
                     <label for="${inputId}" class="subject-label">${subject.name}</label>
                     <span class="credit">(${subject.credits} Cr)</span>
                     <input type="hidden" value="${subject.credits}" data-subject-name="${subject.name}">
                     <input type="number" id="${inputId}" class="marks-input" placeholder="Marks (0-100)" min="0" max="100" step="any" required>`;
                 subjectInputsDiv.appendChild(div);
                 subjectsAdded++;

                 // Apply real-time validation to the newly added input
                 const newInput = div.querySelector('input[type="number"]');
                 if(newInput) createRealTimeValidation(newInput, 0, 100); // Marks 0-100
            });

            // Enable button only if at least one valid subject was added
            if (subjectsAdded > 0) {
                calculateSgpaBtn.disabled = false;
            } else {
                 subjectInputsDiv.innerHTML += '<p class="info-text">No valid subjects could be loaded. Check syllabus data for credits.</p>';
            }

        } else if (branch && year && semType) {
            // Condition when selection is made but no subjects array found
            subjectInputsDiv.innerHTML += '<p class="info-text">Syllabus data might be incomplete or unavailable for this specific semester.</p>';
        }
        // If no branch/year/semtype, the default message remains.
    }

    branchSelect?.addEventListener('change', updateYearOptionsSGPA);
    yearSgpaSelect?.addEventListener('change', updateSemesterOptionsSGPA);
    semesterTypeRadios.forEach(radio => radio.addEventListener('change', populateSubjectsSGPA));

    calculateSgpaBtn?.addEventListener('click', () => {
        clearValidationErrors(sgpaSection);
        const subjectRows = subjectInputsDiv?.querySelectorAll('.subject-input-row'); // Select only valid rows added
        if (!subjectRows || subjectRows.length === 0) {
            displayErrorMessage(sgpaSection, 'No subjects loaded or found. Please select branch, year, semester and check syllabus data.', sgpaResultDiv);
            return;
        }

        let totalWeightedPoints = 0;
        let totalCredits = 0;
        const subjectData = []; // For chart
        let isValid = true;
        let firstInvalidInput = null;
        let invalidCreditsFound = false;

        subjectRows.forEach((row) => {
            const creditInput = row.querySelector('input[type="hidden"]');
            const marksInput = row.querySelector('.marks-input'); // Use class selector
            const subjectName = creditInput.getAttribute('data-subject-name');
            const credits = parseInt(creditInput.value);

             // Check credits first (should be pre-validated by populateSubjectsSGPA, but double-check)
             if (isNaN(credits) || credits <= 0) {
                 console.error(`Invalid credits (${credits}) found during calculation for subject: ${subjectName}`);
                 isValid = false;
                 invalidCreditsFound = true;
                 const creditSpan = row.querySelector('.credit');
                 if(creditSpan) creditSpan.classList.add('error-text');
                 if (!firstInvalidInput && marksInput) firstInvalidInput = marksInput; // Point to related input
                 return; // Skip this row for calculation
             } else {
                // Ensure error style is removed if credits are valid
                const creditSpan = row.querySelector('.credit');
                if(creditSpan) creditSpan.classList.remove('error-text');
             }

            // Validate marks input
            let marks = null;
            let gradePoint = null;
            const marksStr = marksInput.value.trim();
            if (!marksInput || marksStr === '' || isNaN(parseFloat(marksStr))) {
                if(marksInput) marksInput.classList.add('error');
                isValid = false;
                if (!firstInvalidInput && marksInput) firstInvalidInput = marksInput;
            } else {
                 marks = parseFloat(marksStr);
                 // Use Number.isFinite for strict check (e.g., handles "100..")
                 if (!Number.isFinite(marks) || marks < 0 || marks > 100) {
                     marksInput.classList.add('error');
                     isValid = false;
                     if (!firstInvalidInput) firstInvalidInput = marksInput;
                 } else {
                     marksInput.classList.remove('error');
                     gradePoint = getGradePointFromMarks(marks); // Uses the helper function
                     // getGradePointFromMarks now returns 0 for invalid/out-of-range, so no null check needed here
                 }
            }

            // Add to totals only if marks were validly entered (gradePoint determined) and credits are valid
            // Note: gradePoint can be 0 legitimately (fail), so check marksStr instead of gradePoint directly for validity check
            if (isValid && marksStr !== '' && Number.isFinite(marks) && marks >= 0 && marks <= 100 && !isNaN(credits) && credits > 0) {
                totalWeightedPoints += gradePoint * credits;
                totalCredits += credits;
                subjectData.push({
                    name: subjectName,
                    weightedPoints: gradePoint * credits,
                    credits: credits,
                    gradePoint: gradePoint,
                    marks: Math.round(marks) // Store rounded marks for display consistency
                });
            } else if (marksStr !== '') {
                // If marks were entered but deemed invalid, ensure isValid is false
                isValid = false;
                if(marksInput && !firstInvalidInput) firstInvalidInput = marksInput;
            }
        }); // End forEach subjectRow

         if (!isValid) {
             let errorMsg = 'Please enter valid marks (0-100) for all highlighted subjects.';
             if (invalidCreditsFound) errorMsg += ' Invalid subject credits (marked red) were detected. Check syllabus data.';
             displayErrorMessage(sgpaSection, errorMsg, sgpaResultDiv);
             sgpaChartContainer?.classList.add('hidden');
             firstInvalidInput?.focus();
             return;
         }

         if (totalCredits <= 0) {
             // This case should ideally be prevented by populateSubjects checking credits, but good safeguard.
             displayErrorMessage(sgpaSection, 'Total credits for valid subjects is zero. Cannot calculate SGPA. Check subject credits in syllabus data.', sgpaResultDiv);
             sgpaChartContainer?.classList.add('hidden');
             return;
         }

        const sgpa = totalWeightedPoints / totalCredits;
        sgpaResultDiv.textContent = `Calculated SGPA: ${sgpa.toFixed(2)}`;
        sgpaResultDiv.classList.remove('hidden', 'error-message');

        // --- SGPA Chart Creation ---
        if (sgpaChartInstance) sgpaChartInstance.destroy();
        if (!sgpaCanvas || !sgpaChartContainer) {
             console.warn("SGPA chart canvas or container not found. Skipping chart.");
             return;
        }

        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        const labelColor = isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)';

        // Define colors - use a generator for more colors if needed
        const baseBackgroundColors = [
            'rgba(255, 99, 132, 0.7)', 'rgba(54, 162, 235, 0.7)', 'rgba(255, 206, 86, 0.7)',
            'rgba(75, 192, 192, 0.7)', 'rgba(153, 102, 255, 0.7)', 'rgba(255, 159, 64, 0.7)',
            'rgba(199, 199, 199, 0.7)', 'rgba(83, 102, 255, 0.7)', 'rgba(40, 159, 64, 0.7)',
            'rgba(210, 130, 50, 0.7)' // Added more
        ];
        const backgroundColors = subjectData.map((_, i) => baseBackgroundColors[i % baseBackgroundColors.length]);
        const borderColors = backgroundColors.map(c => c.replace('0.7', '1'));


        sgpaChartInstance = new Chart(sgpaCanvas, {
            type: 'doughnut',
            data: {
                labels: subjectData.map(d => `${d.name} (${d.credits} Cr)`),
                datasets: [{
                    label: 'Weighted Grade Points (Credit × GP)',
                    data: subjectData.map(d => d.weightedPoints),
                    backgroundColor: backgroundColors,
                    borderColor: borderColors,
                    borderWidth: 1,
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '45%',
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { boxWidth: 12, padding: 15, color: labelColor }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(ctx) { // More informative tooltip
                                let label = ctx.label || '';
                                if (label) label += ': ';
                                const i = ctx.dataIndex;
                                if (ctx.parsed !== null && i < subjectData.length) {
                                    const currentData = subjectData[i];
                                    const gp = currentData?.gradePoint ?? 'N/A';
                                    const marks = currentData?.marks ?? 'N/A';
                                    // Calculate percentage contribution to total weighted points
                                    const totalWeightedPts = ctx.dataset.data.reduce((s,v)=>s+(v||0),0);
                                    const percentage = totalWeightedPts > 0 ? ((ctx.parsed / totalWeightedPts) * 100).toFixed(1) : 0;

                                    label += `${ctx.parsed?.toFixed(1) ?? 'N/A'} Pts (GP: ${gp}, Marks: ${marks}, ≈${percentage}% of total)`;
                                } else {
                                    label += 'N/A';
                                }
                                return label;
                            }
                        }
                    },
                    title: { display: false } // Using HTML H3 for title
                },
                 animation: { duration: 800 } // Keep animations enabled
            }
        });
        sgpaChartContainer.classList.remove('hidden');
    });


    // --- Enhanced Theme Toggle with Animation ---
    toggleDarkModeBtn?.addEventListener('click', () => {
        const root = document.documentElement;
        root.style.transition = 'background-color 0.5s ease, color 0.5s ease'; // Smooth transition

        const currentTheme = root.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        applyTheme(newTheme); // Apply theme and update charts

        const icon = toggleDarkModeBtn.querySelector('i');
        if (icon) {
            icon.style.transition = 'transform 0.5s ease';
            icon.style.transform = 'rotate(360deg)';
            // Reset transform after animation, remove global transition shortly after
            setTimeout(() => {
                icon.style.transform = '';
                 setTimeout(() => { root.style.transition = ''; }, 50); // Remove transition after a frame
            }, 500);
        } else {
             setTimeout(() => { root.style.transition = ''; }, 500); // Remove transition if no icon
        }
    });


    // --- Utility function for preparing section for capture ---
    async function prepareSectionForCapture(sectionElement) {
        const elementsToShow = sectionElement.querySelectorAll('.chart-container, .result:not(.hidden):not(.error-message)'); // Select results/charts that are *supposed* to be visible
        const originalStyles = new Map();
        let activeChartInstance = null;
        let originalAnimationConfig = null;

        // 1. Find the active chart instance (if any) in the section
        if (sectionElement === cgpaSection && cgpaChartInstance) activeChartInstance = cgpaChartInstance;
        else if (sectionElement === sgpaSection && sgpaChartInstance) activeChartInstance = sgpaChartInstance;
        // Add other sections/charts if needed (e.g., comparison chart IF exported from its modal)

        // 2. Disable chart animations if a chart exists
        if (activeChartInstance) {
            try {
                 // Store original animation config (might be boolean or object)
                 originalAnimationConfig = JSON.parse(JSON.stringify(activeChartInstance.options.animation || {}));
                 // Disable animation directly
                 activeChartInstance.options.animation = false; // Disable all animations
                 activeChartInstance.update('none'); // Update chart without animating
                 // console.log("Chart animation disabled for capture.");
            } catch (e) { console.error("Error disabling chart animation:", e); }
        }

        // 3. Make elements visible and store original styles
        elementsToShow.forEach(el => {
            originalStyles.set(el, {
                display: el.style.display,
                visibility: el.style.visibility,
                hasClassHidden: el.classList.contains('hidden')
            });
            el.style.display = 'block'; // Force block display for consistent layout capture
            el.style.visibility = 'visible';
            el.classList.remove('hidden');
        });

        // 4. Wait for rendering updates (Increased delay)
        await new Promise(resolve => setTimeout(resolve, CAPTURE_RENDER_DELAY));

        // Return function to restore original state
        return function restoreOriginalState() {
            // Restore styles
            originalStyles.forEach((styleInfo, el) => {
                 el.style.display = styleInfo.display;
                 el.style.visibility = styleInfo.visibility;
                 if (styleInfo.hasClassHidden) {
                    el.classList.add('hidden');
                 } else {
                     el.classList.remove('hidden'); // Ensure it's not hidden if it wasn't originally
                 }
            });

            // Restore chart animations
            if (activeChartInstance && originalAnimationConfig !== null) {
                 try {
                     activeChartInstance.options.animation = originalAnimationConfig;
                     activeChartInstance.update('none'); // Update without animation to apply config
                     // console.log("Chart animation restored.");
                 } catch (e) { console.error("Error restoring chart animation:", e); }
            }
        };
    }

    // --- Improved PDF Export Functionality ---
    exportPdfBtn?.addEventListener('click', async () => {
        const originalBtnText = exportPdfBtn.innerHTML;
        exportPdfBtn.disabled = true;
        exportPdfBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating PDF...';
        let restoreState = () => {}; // Placeholder for cleanup function

        try {
            // Dynamically check for required libraries
            if (typeof window.jspdf === 'undefined' || typeof window.html2canvas === 'undefined') {
                throw new Error("Required libraries (jsPDF or html2canvas) not loaded. Check script imports.");
            }
            const { jsPDF } = window.jspdf;
            const html2canvas = window.html2canvas;

            const activeSection = document.querySelector('.section.active');
            if (!activeSection || activeSection === initialChoice) {
                throw new Error("No active calculation section (SGPA/CGPA) found to export.");
            }

             // Prepare section (disable animations, make visible, wait for render)
             restoreState = await prepareSectionForCapture(activeSection);

            const pdf = new jsPDF({ orientation: 'p', unit: 'pt', format: 'a4' });
            const themeBgColor = getComputedStyle(document.body).backgroundColor; // Get current theme background

            const originalCanvases = activeSection.querySelectorAll('canvas'); // Get original canvases *before* cloning

            console.log(`Capturing section '${activeSection.id}' for PDF...`);
            const canvas = await html2canvas(activeSection, {
                scale: 2, // Increase resolution
                useCORS: true,
                logging: false, // Reduce console noise
                backgroundColor: themeBgColor, // Match current theme background
                windowWidth: activeSection.scrollWidth, // Capture full width
                windowHeight: activeSection.scrollHeight, // Capture full height
                x: 0, y: 0,
                width: activeSection.scrollWidth,
                height: activeSection.scrollHeight,
                onclone: (clonedDoc) => { // Crucial for rendering charts correctly in the clone
                    const clonedCanvases = clonedDoc.querySelectorAll('canvas');
                    clonedCanvases.forEach((clonedCanvas, index) => {
                        if (index < originalCanvases.length && originalCanvases[index].offsetParent !== null) {
                            const originalCanvas = originalCanvases[index];
                            // Ensure dimensions match BEFORE drawing
                            clonedCanvas.width = originalCanvas.width;
                            clonedCanvas.height = originalCanvas.height;
                            const clonedCtx = clonedCanvas.getContext('2d');
                            if (clonedCtx) {
                                try {
                                    clonedCtx.drawImage(originalCanvas, 0, 0);
                                    // console.log(`Canvas ${index} drawn successfully in clone.`);
                                } catch (e) {
                                    console.error(`Error drawing canvas index ${index} in clone for PDF:`, e);
                                    // Optional: Fill with placeholder on error
                                    clonedCtx.fillStyle = 'rgba(200, 0, 0, 0.3)';
                                    clonedCtx.fillRect(0, 0, clonedCanvas.width, clonedCanvas.height);
                                    clonedCtx.fillStyle = 'red'; clonedCtx.font = '12px Arial';
                                    clonedCtx.fillText('Chart Error', 10, 20);
                                }
                             } else { console.warn(`Could not get 2D context for cloned canvas index ${index}.`); }
                        } else if (index >= originalCanvases.length) {
                            console.warn(`Mismatch: Cloned canvas index ${index} has no corresponding original canvas.`);
                        } else {
                            // Original canvas might be hidden (e.g., inside a hidden container)
                            // console.warn(`Original canvas index ${index} seems hidden (offsetParent is null), skipping drawImage for PDF.`);
                        }
                    });
                 }
            });

            console.log("Image capture complete, generating PDF...");

            // ---- Restore original section state ----
            restoreState();
            // ---- End Restore ----

            const imgData = canvas.toDataURL('image/png');
            const imgProps = pdf.getImageProperties(imgData);
            const margin = 40; // Points
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const effectiveWidth = pdfWidth - 2 * margin;
            const effectiveHeight = pdfHeight - 2 * margin;

            // Calculate image dimensions maintaining aspect ratio
            const aspectRatio = imgProps.width / imgProps.height;
            let imgWidth = effectiveWidth;
            let imgHeight = imgWidth / aspectRatio;

            // If calculated height exceeds effective page height, scale down by height instead
             if (imgHeight > effectiveHeight) {
                  imgHeight = effectiveHeight;
                  imgWidth = imgHeight * aspectRatio;
             }

             // Handle pagination if image height is still larger than one page
             let heightLeft = imgHeight;
             let position = margin; // Initial Y position

            // Add first page/image part
            pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
            heightLeft -= effectiveHeight; // Subtract height of the visible part on the first page

            // Add subsequent pages if needed
            while (heightLeft > margin) { // Use margin threshold to avoid tiny slivers on new pages
                position = -heightLeft + margin; // Calculate the negative Y offset for the image slice
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
                heightLeft -= effectiveHeight;
            }

            pdf.save(`${activeSection.id}_Result.pdf`); // Filename based on section ID
            console.log("PDF generated successfully.");

        } catch (error) {
            console.error('PDF export failed:', error);
            alert(`Error generating PDF: ${error.message || 'Unknown error occurred.'}. Please check console for details.`);
            // Attempt to restore state even on error
            restoreState();
        } finally {
            // Ensure button is re-enabled and text restored
            exportPdfBtn.disabled = false;
            exportPdfBtn.innerHTML = originalBtnText;
        }
    });

    // --- Improved Screenshot Save Functionality ---
    saveScreenBtn?.addEventListener('click', async () => {
        const originalBtnText = saveScreenBtn.innerHTML;
        saveScreenBtn.disabled = true;
        saveScreenBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Capturing...';
        let restoreState = () => {}; // Placeholder for cleanup function

        try {
             // Dynamically check for html2canvas
             if (typeof window.html2canvas === 'undefined') {
                 throw new Error("Required library (html2canvas) not loaded. Check script imports.");
             }
             const html2canvas = window.html2canvas;

            const activeSection = document.querySelector('.section.active');
             if (!activeSection || activeSection === initialChoice) {
                 throw new Error("No active calculation section (SGPA/CGPA) found to capture.");
             }

             // Prepare section (disable animations, make visible, wait for render)
             restoreState = await prepareSectionForCapture(activeSection);

             const themeBgColor = getComputedStyle(document.body).backgroundColor; // Get current theme background
             const originalCanvases = activeSection.querySelectorAll('canvas'); // Get original canvases

             console.log(`Capturing section '${activeSection.id}' for Screenshot...`);
             const canvas = await html2canvas(activeSection, {
                 scale: 2, // Higher resolution
                 useCORS: true,
                 logging: false,
                 backgroundColor: themeBgColor, // Use theme background color
                 windowWidth: activeSection.scrollWidth,
                 windowHeight: activeSection.scrollHeight,
                 x: 0, y: 0,
                 width: activeSection.scrollWidth,
                 height: activeSection.scrollHeight,
                 onclone: (clonedDoc) => { // Use the same robust onclone as PDF
                    const clonedCanvases = clonedDoc.querySelectorAll('canvas');
                    clonedCanvases.forEach((clonedCanvas, index) => {
                        if (index < originalCanvases.length && originalCanvases[index].offsetParent !== null) {
                            const originalCanvas = originalCanvases[index];
                            clonedCanvas.width = originalCanvas.width;
                            clonedCanvas.height = originalCanvas.height;
                            const clonedCtx = clonedCanvas.getContext('2d');
                             if (clonedCtx) {
                                try {
                                    clonedCtx.drawImage(originalCanvas, 0, 0);
                                } catch (e) {
                                    console.error(`Error drawing canvas index ${index} in clone for Screenshot:`, e);
                                    clonedCtx.fillStyle = 'rgba(200, 0, 0, 0.3)';
                                    clonedCtx.fillRect(0, 0, clonedCanvas.width, clonedCanvas.height);
                                    clonedCtx.fillStyle = 'red'; clonedCtx.font = '12px Arial';
                                    clonedCtx.fillText('Chart Error', 10, 20);
                                }
                             }
                        } // else: skip hidden or mismatched canvases silently for screenshot
                    });
                }
            });

            console.log("Image capture complete, preparing download...");

            // ---- Restore original section state ----
            restoreState();
            // ---- End Restore ----

            // Create download link
            const link = document.createElement('a');
            link.download = `${activeSection.id}_Screenshot.png`; // Filename based on section ID
            link.href = canvas.toDataURL('image/png');
            link.click(); // Trigger download
            console.log("Screenshot download initiated.");

        } catch (error) {
            console.error("Error capturing screen:", error);
            alert(`Failed to capture screen image: ${error.message || 'Unknown error occurred.'}. Please check console for details.`);
             // Attempt to restore state even on error
             restoreState();
        } finally {
            saveScreenBtn.disabled = false;
            saveScreenBtn.innerHTML = originalBtnText;
        }
    });


    // --- Enhanced Form Validation (Real-time) ---
    const createRealTimeValidation = (inputElement, min, max) => {
        const handleValidation = () => {
            const valueStr = inputElement.value.trim();
            // Don't show error for empty while typing, let 'required' handle submission if needed
             if (valueStr === '') {
                 inputElement.classList.remove('error');
                 return;
             }
            // Use Number.isFinite for strict check (handles "1.2.3", "NaN", etc.)
            const value = parseFloat(valueStr);
            if (!Number.isFinite(value) || value < min || value > max) {
                inputElement.classList.add('error');
            } else {
                inputElement.classList.remove('error');
            }
        };
        // Use 'input' for immediate feedback (typing, pasting, spinners)
        inputElement.addEventListener('input', handleValidation);
        // Use 'blur' to catch validation when user leaves the field
        inputElement.addEventListener('blur', handleValidation);
    };


    // --- Modal Handling ---
    function openModal(modalElement) {
        if(modalElement) modalElement.classList.remove('hidden');
    }
    function closeModal(modalElement) {
        if(modalElement) modalElement.classList.add('hidden');
    }

    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            closeModal(btn.closest('.modal')); // Close the nearest parent modal
        });
    });
    // Close modal if clicked outside the content area
    window.addEventListener('click', (event) => {
        if (event.target.classList.contains('modal')) {
            closeModal(event.target);
        }
    });

    helpBtn?.addEventListener('click', (e) => { e.preventDefault(); openModal(helpModal); });
    feedbackBtn?.addEventListener('click', (e) => { e.preventDefault(); openModal(feedbackModal); });

    // --- Feedback Form Handling ---
    feedbackForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        const typeElement = feedbackForm.querySelector('#feedback-type');
        const contentElement = feedbackForm.querySelector('#feedback-content');
        const nameElement = feedbackForm.querySelector('#feedback-name');
        const emailElement = feedbackForm.querySelector('#feedback-email');
        const submitBtn = feedbackForm.querySelector('button[type="submit"]');

        const type = typeElement?.value;
        const content = contentElement?.value.trim();
        const name = nameElement?.value.trim(); // Optional
        const email = emailElement?.value.trim(); // Optional

        // Basic validation
        if (!type || !content) {
             alert("Please select a feedback type and provide your feedback content.");
             contentElement?.focus();
             return;
         }

        // --- TODO: Replace with actual fetch() call to your backend endpoint ---
        console.log("Simulating Feedback Submission:", { name, email, type, content });
        const originalBtnTextFeedback = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';

        // Simulate network request
        setTimeout(() => {
            alert("Thank you for your feedback!");
            closeModal(feedbackModal);
            feedbackForm.reset(); // Clear the form fields
            submitBtn.disabled = false;
            submitBtn.textContent = originalBtnTextFeedback;
        }, 800);
        // --- End Simulation ---
    });

    // --- Reset All Data Button ---
    resetDataBtn?.addEventListener('click', () => {
        let sectionToReset = '';
        let activeSectionElement = null;

        if (cgpaSection?.classList.contains('active')) {
             sectionToReset = 'CGPA Calculation';
             activeSectionElement = cgpaSection;
        } else if (sgpaSection?.classList.contains('active')) {
             sectionToReset = 'SGPA Calculation';
             activeSectionElement = sgpaSection;
        } else {
            // Optional: Reset initial choice view or do nothing
            alert("Please navigate to the SGPA or CGPA calculator section to reset data.");
            return;
        }

        if (confirm(`Are you sure you want to clear all entered data in the ${sectionToReset} section? This cannot be undone.`)) {
            if (activeSectionElement === cgpaSection) {
                 resetCgpaSection(); // Resets inputs, results, chart
                 // Also clear related comparison data store if CGPA section is reset
                 allSemesterDataStore = [];
                 if (comparisonChartInstance) {
                     comparisonChartInstance.destroy();
                     comparisonChartInstance = null;
                 }
                 closeModal(comparisonModal); // Close comparison modal if open
            } else if (activeSectionElement === sgpaSection) {
                 // Reset SGPA form (easiest way is to reset branch and trigger chain reaction)
                 if (branchSelect) branchSelect.value = '';
                 updateYearOptionsSGPA(); // This will cascade resets
            }
            alert(`Data for the ${sectionToReset} section has been cleared.`);
        }
    });

     // --- Compare Performance Button & Chart ---
    let allSemesterDataStore = []; // Stores { semester: num, sgpa: num } from CGPA section

    function updateAllSemesterData() {
        // Gather SGPA data ONLY from the CGPA input section for comparison consistency
        allSemesterDataStore = []; // Clear previous data
        const semesterRows = previousSemestersDiv?.querySelectorAll('.semester-input-row');
        if (!semesterRows) return false;

        let dataFound = false;
        semesterRows.forEach(row => {
            const sgpaInput = row.querySelector('input[type="number"]');
            const semesterNumber = parseInt(row.getAttribute('data-sem-num'));
            // Check if input exists, has a value, and the value is a valid SGPA
            if (sgpaInput && sgpaInput.value.trim() !== '') {
                const sgpa = parseFloat(sgpaInput.value);
                 if(Number.isFinite(sgpa) && sgpa >= 0 && sgpa <= 10){
                     allSemesterDataStore.push({ semester: semesterNumber, sgpa: sgpa });
                     dataFound = true;
                 }
            }
        });
         allSemesterDataStore.sort((a, b) => a.semester - b.semester); // Sort by semester number
         return dataFound; // Indicate if any valid data was gathered
    }

    calculateComparisonBtn?.addEventListener('click', () => {
        if (!comparisonChartCanvas) {
            console.error("Comparison chart canvas element not found.");
            alert("Error: Comparison chart display area is missing in the HTML.");
            return;
        }

        const dataAvailable = updateAllSemesterData(); // Refresh data from CGPA section

        if (!dataAvailable) {
             alert("No valid SGPA data found in the CGPA Calculator section.\n\nPlease enter semester SGPA values there first to enable comparison.");
             return;
         }

        if (comparisonChartInstance) {
            comparisonChartInstance.destroy();
            comparisonChartInstance = null;
        }

        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
        const labelColor = isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)';

        // Use dynamic colors based on number of semesters
        const baseColors = [
             'rgba(54, 162, 235, 0.6)', 'rgba(255, 99, 132, 0.6)', 'rgba(75, 192, 192, 0.6)',
             'rgba(255, 206, 86, 0.6)', 'rgba(153, 102, 255, 0.6)', 'rgba(255, 159, 64, 0.6)',
             'rgba(199, 199, 199, 0.6)', 'rgba(83, 102, 255, 0.6)' // 8 colors, repeat if more sems
         ];
         const backgroundColors = allSemesterDataStore.map((_, index) => baseColors[index % baseColors.length]);
         const borderColors = backgroundColors.map(color => color.replace('0.6', '1'));


        comparisonChartInstance = new Chart(comparisonChartCanvas, {
            type: 'bar', // Bar chart is good for comparing distinct semester values
            data: {
                labels: allSemesterDataStore.map(data => `Sem ${data.semester}`),
                datasets: [{
                    label: 'SGPA',
                    data: allSemesterDataStore.map(data => data.sgpa),
                    backgroundColor: backgroundColors,
                    borderColor: borderColors,
                    borderWidth: 1
                }]
            },
            options: {
                indexAxis: 'x', // Ensure bars are vertical
                scales: {
                    y: {
                         beginAtZero: true, max: 10,
                         title: { display: true, text: 'SGPA', color: labelColor },
                         ticks: { color: labelColor },
                         grid: { color: gridColor }
                     },
                     x: {
                         title: { display: true, text: 'Semester', color: labelColor },
                         ticks: { color: labelColor },
                         grid: { color: gridColor }
                     }
                },
                responsive: true,
                maintainAspectRatio: false, // Important for resizing within modal
                plugins: {
                     title: { display: true, text: 'SGPA Performance Comparison (from CGPA entries)', color: labelColor },
                     legend: { display: false }, // Hide legend for single dataset
                     tooltip: { mode: 'index', intersect: false }
                 }
            }
        });

        openModal(comparisonModal); // Show the modal with the chart
    });


    // --- Initial Setup ---
    function initializeApp() {
        console.log("Initializing GPA/CGPA Calculator...");

        // Check essential elements exist
        if (!initialChoice || !cgpaSection || !sgpaSection) {
             console.error("Core section elements not found. Aborting initialization.");
             document.body.innerHTML = '<p style="color: red; font-weight: bold; padding: 20px;">Error: Could not initialize calculator. Essential HTML elements are missing.</p>';
             return;
        }

        populateSyllabusInfo(); // Populate syllabus display/data first
        applyTheme(localStorage.getItem('theme') || 'light'); // Apply saved or default theme
        resetCgpaSection(); // Reset CGPA form on initial load
        updateYearOptionsSGPA(); // Reset SGPA form state

        // Add data-label attributes for Grading Table responsiveness (if table exists)
        if (gradingTableBody) {
             gradingTableBody.querySelectorAll('tr').forEach(tr => {
                  tr.querySelectorAll('td').forEach((td, index) => {
                       const headerCell = document.querySelector(`#grading-table thead th:nth-child(${index + 1})`);
                       if (headerCell) {
                           td.setAttribute('data-label', headerCell.textContent.trim());
                       }
                   });
             });
        } else {
            console.warn("Grading table body not found. Skipping data-label setup.");
        }

        console.log("GPA/CGPA Calculator Initialized Successfully.");
    }

    // --- Run Initialization ---
    try {
         initializeApp();
    } catch (error) {
         console.error("Critical error during initialization:", error);
         document.body.innerHTML = `<p style="color: red; font-weight: bold; padding: 20px;">Error: Application failed to initialize. ${error.message}. Check console.</p>`;
    }

}); // End DOMContentLoaded