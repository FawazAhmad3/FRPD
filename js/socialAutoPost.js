// socialAutoPost.js
// Simulates an automation workflow where new content added automatically generates social media drafts.

const socialAutoPost = {
    /**
     * Generates a nicely formatted social media post from data
     * @param {string} type 'blog', 'project', 'event'
     * @param {object} dataObj the content object
     * @returns {string} formatted text
     */
    generatePost(type, dataObj) {
        let text = '';
        if (type === 'blog') {
            text = `📢 New Publication Alert! 📢\n\nRead our latest article: "${dataObj.title}"\n\n💡 Summary: ${dataObj.summary}\n\n📖 Read it here: ${window.location.origin}/pages/blog-detail.html?id=${dataObj.id}\n\n#Research #FRPD #Innovation`;
        } else if (type === 'project') {
            text = `🚀 Project Update! 🚀\n\nWe have a new project: "${dataObj.title}" [${dataObj.status}]\n\n📌 Details: ${dataObj.description}\n\n#ResearchProject #FRPD #Development`;
        } else if (type === 'course') {
            text = `🎓 Level up your skills! 🎓\n\nEnroll in our new course: "${dataObj.title}"\n\n⏰ Duration: ${dataObj.duration}\n\n#Training #FRPD #Education`;
        }
        return text;
    },

    /**
     * Simulates publishing the content to webhook or internal system
     */
    publish(type, dataObj) {
        const formattedText = this.generatePost(type, dataObj);

        // Log to console to simulate the automation logic working behind the scenes
        console.group('[Social Auto Post Bot] Generated Content Workflow');
        console.log(`TYPE: ${type.toUpperCase()}`);
        console.log(`PAYLOAD DETECTED - Preparing to send to WhatsApp, LinkedIn, Facebook, Instagram APIs...`);
        console.log(`--- POST CONTENT DRAFT ---`);
        console.log(formattedText);
        console.log(`--------------------------`);
        console.groupEnd();

        return formattedText;
    }
};

// Example Hook usage: if a user or system adds an item, they could call:
// socialAutoPost.publish('blog', newBlogObject);

window.socialAutoPost = socialAutoPost;
